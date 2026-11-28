package com.pronostika.backend.service;

import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.pronostika.backend.dto.QuinielaPartidoDTO;
import com.pronostika.backend.dto.CrearQuinielaDTO;
import com.pronostika.backend.dto.PaginaDTO;
import com.pronostika.backend.dto.QuinielaDTO;
import com.pronostika.backend.dto.QuinielaGuardadaDTO;
import com.pronostika.backend.dto.QuinielaResumenDTO;
import com.pronostika.backend.dto.SeleccionPartidoDTO;
import com.pronostika.backend.entity.Partido;
import com.pronostika.backend.entity.Quiniela;
import com.pronostika.backend.entity.Usuario;
import com.pronostika.backend.exception.RecursoNoEncontradoException;
import com.pronostika.backend.exception.ReglaNegocioException;
import com.pronostika.backend.repository.PartidoRepository;
import com.pronostika.backend.repository.QuinielaRepository;
import com.pronostika.backend.repository.UsuarioRepository;

/**
 * Lógica del módulo de quinielas: guardar una quiniela con sus partidos
 * (tabla pivote quiniela_partidos) y consultarlas.
 */
@Service
public class QuinielaService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final int TAMANIO_MAXIMO = 50;

    private final QuinielaRepository quinielaRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TwilioService twilioService;
    private final TransactionTemplate transactionTemplate;

    public QuinielaService(QuinielaRepository quinielaRepository,
            PartidoRepository partidoRepository,
            UsuarioRepository usuarioRepository,
            TwilioService twilioService,
            PlatformTransactionManager transactionManager) {
        this.quinielaRepository = quinielaRepository;
        this.partidoRepository = partidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.twilioService = twilioService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    /**
     * Guarda la quiniela en una transacción y, ya confirmada, envía la
     * confirmación por SMS y WhatsApp al teléfono del usuario. Si Twilio
     * falla o no está configurado, la quiniela queda guardada de todos modos.
     */
    public QuinielaGuardadaDTO guardar(String email, CrearQuinielaDTO dto) {
        Guardado guardado = transactionTemplate.execute(estado -> persistir(email, dto));

        boolean sms = false;
        boolean whatsapp = false;
        String telefono = guardado.telefono();
        if (telefono != null && !telefono.isBlank()) {
            String mensajeSms = mensajeConfirmacion(guardado.nombre(), guardado.quiniela());
            String mensajeWa = mensajeWhatsapp(guardado.nombre(), guardado.quiniela());
            sms = twilioService.enviarSms(telefono, mensajeSms);
            whatsapp = twilioService.enviarWhatsapp(telefono, mensajeWa);
        }
        return new QuinielaGuardadaDTO(guardado.quiniela(), sms, whatsapp);
    }

    @Transactional(readOnly = true)
    public PaginaDTO<QuinielaResumenDTO> listarMias(String email, Pageable pageable) {
        Pageable seguro = PageRequest.of(pageable.getPageNumber(),
                Math.min(pageable.getPageSize(), TAMANIO_MAXIMO),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PaginaDTO.de(quinielaRepository.findByUsuarioEmail(email, seguro), QuinielaResumenDTO::desde);
    }

    @Transactional(readOnly = true)
    public QuinielaDTO obtener(Long id, String email, boolean esAdmin) {
        Quiniela quiniela = quinielaRepository.findDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la quiniela con id " + id));
        if (!esAdmin && !quiniela.getUsuario().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("La quiniela pertenece a otro usuario");
        }
        return QuinielaDTO.desde(quiniela);
    }

    private Guardado persistir(String email, CrearQuinielaDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario " + email));

        Set<Long> ids = new HashSet<>();
        for (SeleccionPartidoDTO s : dto.selecciones()) {
            if (!ids.add(s.partidoId())) {
                throw new ReglaNegocioException("El partido " + s.partidoId() + " está repetido en la quiniela");
            }
        }

        Map<Long, Partido> partidos = partidoRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Partido::getId, Function.identity()));
        List<Long> faltantes = ids.stream().filter(id -> !partidos.containsKey(id)).sorted().toList();
        if (!faltantes.isEmpty()) {
            throw new RecursoNoEncontradoException("No existen los partidos con id " + faltantes);
        }

        Quiniela quiniela = new Quiniela();
        quiniela.setUsuario(usuario);
        quiniela.setNombreJornada(dto.nombreJornada().trim());
        quiniela.setPuntosTotales(0);
        for (SeleccionPartidoDTO s : dto.selecciones()) {
            quiniela.agregarPartido(partidos.get(s.partidoId()), s.seleccion().toUpperCase());
        }

        Quiniela guardada = quinielaRepository.save(quiniela);
        return new Guardado(QuinielaDTO.desde(guardada), usuario.getNombre(), usuario.getTelefono());
    }

    private static String mensajeConfirmacion(String nombre, QuinielaDTO q) {
        String primera = q.partidos().stream()
                .map(p -> p.fechaPartido())
                .filter(f -> f != null)
                .min(Comparable::compareTo)
                .map(FORMATO_FECHA::format)
                .orElse("por definir");
        return "Pronostika: Hola " + nombre + ", tu quiniela \"" + q.nombreJornada()
                + "\" (folio #" + q.id() + ") quedó registrada con " + q.totalPartidos()
                + " partidos. Primer partido: " + primera + ". ¡Suerte!";
    }


    private static String mensajeWhatsapp(String nombre, QuinielaDTO q) {
        String primera = q.partidos().stream()
                .map(p -> p.fechaPartido())
                .filter(f -> f != null)
                .min(Comparable::compareTo)
                .map(FORMATO_FECHA::format)
                .orElse("por definir");

        StringBuilder sb = new StringBuilder();
        sb.append("*Pronostika · Confirmación de Quiniela*\n");
        sb.append("Hola ").append(nombre).append(", tu quiniela quedó registrada.\n\n");
        sb.append("*Jornada:* ").append(q.nombreJornada()).append("\n");
        sb.append("*Folio:* #").append(q.id()).append("\n");
        sb.append("*Primer partido:* ").append(primera).append("\n\n");
        sb.append("*Tus predicciones (").append(q.totalPartidos()).append("):*\n");

        for (QuinielaPartidoDTO p : q.partidos()) {
            sb.append("• ")
              .append(p.equipoLocal()).append(" vs ").append(p.equipoVisitante())
              .append(" → *").append(p.seleccion()).append("*\n");
        }

        sb.append("\n¡Mucha suerte en la jornada!");
        return sb.toString();
    }

    private record Guardado(QuinielaDTO quiniela, String nombre, String telefono) {
    }
}
