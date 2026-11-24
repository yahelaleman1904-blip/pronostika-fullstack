package com.pronostika.backend.controller;

import com.pronostika.backend.dto.AuthResponseDTO;
import com.pronostika.backend.dto.LoginRequestDTO;
import com.pronostika.backend.dto.RecuperarPasswordDTO;
import com.pronostika.backend.dto.RegisterRequestDTO;
import com.pronostika.backend.entity.Rol;
import com.pronostika.backend.entity.TokenInvalidado;
import com.pronostika.backend.entity.Usuario;
import com.pronostika.backend.exception.ReglaNegocioException;
import com.pronostika.backend.repository.RolRepository;
import com.pronostika.backend.repository.TokenInvalidadoRepository;
import com.pronostika.backend.repository.UsuarioRepository;
import com.pronostika.backend.security.CustomUserDetailsService;
import com.pronostika.backend.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TokenInvalidadoRepository tokenInvalidadoRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(req.getEmail()).orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
        String rolNombre = usuario.getRol().getNombre();
        String token = jwtService.generateToken(userDetails, rolNombre);

        return ResponseEntity.ok(new AuthResponseDTO(
                token, usuario.getId(), usuario.getNombre(), usuario.getApellido(),
                usuario.getEmail(), rolNombre, usuario.getAvatarUrl()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO req) {
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new ReglaNegocioException("El correo ya está registrado");
        }

        Rol rolUsuario = rolRepository.findByNombre("ROLE_USUARIO").orElseThrow();
        Usuario nuevo = new Usuario();
        nuevo.setNombre(req.getNombre());
        nuevo.setApellido(req.getApellido());
        nuevo.setEmail(req.getEmail());
        nuevo.setPassword(passwordEncoder.encode(req.getPassword()));
        nuevo.setTelefono(req.getTelefono());
        nuevo.setRol(rolUsuario);
        nuevo.setActivo(true);
        usuarioRepository.save(nuevo);

        UserDetails userDetails = userDetailsService.loadUserByUsername(nuevo.getEmail());
        String token = jwtService.generateToken(userDetails, rolUsuario.getNombre());

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponseDTO(
                token, nuevo.getId(), nuevo.getNombre(), nuevo.getApellido(),
                nuevo.getEmail(), rolUsuario.getNombre(), nuevo.getAvatarUrl()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (!tokenInvalidadoRepository.existsByToken(token)) {
                var exp = jwtService.extractExpiration(token).toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDateTime();
                tokenInvalidadoRepository.save(new TokenInvalidado(null, token, exp));
            }
        }
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada e invalidación de token exitosa"));
    }

    @PostMapping("/recuperar-password")
    public ResponseEntity<?> recuperarPassword(@Valid @RequestBody RecuperarPasswordDTO req) {
        return ResponseEntity.ok(Map.of("mensaje", "Si el correo existe, recibirás instrucciones para restablecer tu contraseña"));
    }
}