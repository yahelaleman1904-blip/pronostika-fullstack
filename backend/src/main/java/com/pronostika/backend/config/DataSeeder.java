package com.pronostika.backend.config;

import com.pronostika.backend.entity.*;
import com.pronostika.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final LigaRepository ligaRepository;
    private final PartidoRepository partidoRepository;
    private final PronosticoRepository pronosticoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        Rol adminRol = rolRepository.findByNombre("ROLE_ADMIN").orElseThrow();
        Rol analistaRol = rolRepository.findByNombre("ROLE_ANALISTA").orElseThrow();
        Rol usuarioRol = rolRepository.findByNombre("ROLE_USUARIO").orElseThrow();

        Usuario admin = crearUsuario("Admin", "Pronostika", "admin@pronostika.com", "Admin123!", "+529510000001", adminRol);
        Usuario analista = crearUsuario("Carlos", "Analista", "analista@pronostika.com", "Analista123!", "+529510000002", analistaRol);
        crearUsuario("Mario", "Usuario", "usuario@pronostika.com", "Usuario123!", "+529510000003", usuarioRol);

        Liga laLiga = crearLiga("LaLiga", "España");
        Liga ligaMx = crearLiga("Liga MX", "México");
        Liga premier = crearLiga("Premier League", "Inglaterra");
        Liga serieA = crearLiga("Serie A", "Italia");
        Liga bundes = crearLiga("Bundesliga", "Alemania");

        List<Partido> partidos = partidoRepository.saveAll(List.of(
                crearPartido(laLiga, "Real Betis", "Getafe CF", 1, "PENDIENTE"),
                crearPartido(laLiga, "Real Madrid", "FC Barcelona", 1, "PENDIENTE"),
                crearPartido(laLiga, "Atlético Madrid", "Villarreal", 2, "PENDIENTE"),
                crearPartido(ligaMx, "América", "Guadalajara", 2, "PENDIENTE"),
                crearPartido(ligaMx, "Cruz Azul", "Pumas UNAM", 2, "PENDIENTE"),
                crearPartido(ligaMx, "Tigres UANL", "Monterrey", 3, "PENDIENTE"),
                crearPartido(ligaMx, "Toluca", "Pachuca", 3, "PENDIENTE"),
                crearPartido(premier, "Man City", "Arsenal", 3, "EN_VIVO"),
                crearPartido(premier, "Liverpool", "Chelsea", 4, "PENDIENTE"),
                crearPartido(premier, "Man United", "Tottenham", 4, "PENDIENTE"),
                crearPartido(serieA, "Inter Milan", "AC Milan", 4, "PENDIENTE"),
                crearPartido(serieA, "Juventus", "Napoli", 5, "PENDIENTE"),
                crearPartido(serieA, "Roma", "Lazio", 5, "PENDIENTE"),
                crearPartido(bundes, "Bayern Munich", "Borussia Dortmund", 5, "PENDIENTE"),
                crearPartido(bundes, "RB Leipzig", "Bayer Leverkusen", 6, "PENDIENTE")
        ));

        for (int i = 0; i < partidos.size(); i++) {
            Partido p = partidos.get(i);
            pronosticoRepository.save(Pronostico.builder()
                    .partido(p)
                    .usuario(i % 2 == 0 ? analista : admin)
                    .ganadorPrevisto(i % 3 == 0 ? "Empate" : p.getEquipoLocal())
                    .probabilidad(55 + (i * 2) % 35)
                    .estado(i < 5 ? "ACERTADA" : "PENDIENTE")
                    .build());
        }
    }

    private Usuario crearUsuario(String nombre, String apellido, String email, String pass, String tel, Rol rol) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(pass));
        u.setTelefono(tel);
        u.setRol(rol);
        u.setActivo(true);
        return usuarioRepository.save(u);
    }

    private Liga crearLiga(String nombre, String pais) {
        Liga l = new Liga();
        l.setNombre(nombre);
        l.setPais(pais);
        return ligaRepository.save(l);
    }

    private Partido crearPartido(Liga liga, String local, String visita, int dias, String estado) {
        Partido p = new Partido();
        p.setLiga(liga);
        p.setEquipoLocal(local);
        p.setEquipoVisitante(visita);
        p.setFechaPartido(LocalDateTime.now().plusDays(dias));
        p.setEstado(estado);
        return p;
    }
}