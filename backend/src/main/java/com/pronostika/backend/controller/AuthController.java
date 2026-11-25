package com.pronostika.backend.controller;

import com.pronostika.backend.dto.AuthResponseDTO;
import com.pronostika.backend.dto.LoginRequestDTO;
import com.pronostika.backend.dto.RecuperarPasswordDTO;
import com.pronostika.backend.dto.RegisterRequestDTO;
import com.pronostika.backend.dto.RestablecerPasswordDTO;
import com.pronostika.backend.entity.Rol;
import com.pronostika.backend.entity.TokenInvalidado;
import com.pronostika.backend.entity.Usuario;
import com.pronostika.backend.exception.ReglaNegocioException;
import com.pronostika.backend.repository.RolRepository;
import com.pronostika.backend.repository.TokenInvalidadoRepository;
import com.pronostika.backend.repository.UsuarioRepository;
import com.pronostika.backend.security.CustomUserDetailsService;
import com.pronostika.backend.security.JwtService;
import com.pronostika.backend.service.TwilioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private record CodigoRecuperacion(String codigo, LocalDateTime expiraEn) {}
    private final Map<String, CodigoRecuperacion> codigosActivos = new ConcurrentHashMap<>();

    private final AuthenticationManager authManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TokenInvalidadoRepository tokenInvalidadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final TwilioService twilioService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:no-reply@pronostika.com}")
    private String mailFrom;

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

        // 1. Correo de bienvenida
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(mailFrom);
                msg.setTo(nuevo.getEmail());
                msg.setSubject("¡Bienvenido a Pronostika!");
                msg.setText("Hola " + nuevo.getNombre() + ",\n\n"
                        + "Tu cuenta en Pronostika fue creada correctamente.\n"
                        + "Ya puedes iniciar sesión, armar tu quiniela y consultar las probabilidades de la jornada.\n\n"
                        + "Equipo Pronostika.");
                mailSender.send(msg);
                log.info("Correo de bienvenida enviado a {}", nuevo.getEmail());
            } catch (Exception ex) {
                log.error("No se pudo enviar el correo de bienvenida a {}: {}", nuevo.getEmail(), ex.getMessage());
            }
        }

        // 2. Bienvenida opcional por WhatsApp
        if (nuevo.getTelefono() != null && !nuevo.getTelefono().isBlank()) {
            twilioService.enviarWhatsapp(
                    nuevo.getTelefono(),
                    "¡Bienvenido a Pronostika, " + nuevo.getNombre() + "! Tu cuenta fue creada correctamente."
            );
        }

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
        String email = req.getEmail().trim().toLowerCase();
        var usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String codigo = String.format("%06d", RANDOM.nextInt(1_000_000));
            codigosActivos.put(email, new CodigoRecuperacion(codigo, LocalDateTime.now().plusMinutes(10)));

            log.info("[RECUPERACION] Código para {}: {} (válido 10 min)", email, codigo);

            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender != null) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(mailFrom);
                    msg.setTo(email);
                    msg.setSubject("Pronostika - Código de recuperación de contraseña");
                    msg.setText("Hola " + usuario.getNombre() + ",\n\n"
                            + "Tu código de seguridad para restablecer tu contraseña es: " + codigo + "\n"
                            + "Este código expira en 10 minutos.\n\n"
                            + "Si no solicitaste este cambio, ignora este mensaje.");
                    mailSender.send(msg);
                    log.info("Correo de recuperación enviado a {}", email);
                } catch (Exception ex) {
                    log.error("No se pudo enviar el correo a {}: {}", email, ex.getMessage());
                }
            }

            if (usuario.getTelefono() != null && !usuario.getTelefono().isBlank()) {
                twilioService.enviarWhatsapp(
                        usuario.getTelefono(),
                        "Pronostika: Tu código de recuperación es *" + codigo + "*. Expira en 10 minutos."
                );
            }
        }

        return ResponseEntity.ok(Map.of(
                "mensaje", "Si el correo está registrado, enviamos un código de 6 dígitos a tu correo y WhatsApp."
        ));
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<?> restablecerPassword(@Valid @RequestBody RestablecerPasswordDTO req) {
        String email = req.getEmail().trim().toLowerCase();
        CodigoRecuperacion registro = codigosActivos.get(email);

        if (registro == null || registro.expiraEn().isBefore(LocalDateTime.now())) {
            codigosActivos.remove(email);
            throw new ReglaNegocioException("El código expiró o no existe. Solicita uno nuevo.");
        }

        if (!registro.codigo().equals(req.getCodigo().trim())) {
            throw new ReglaNegocioException("El código de seguridad es incorrecto.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ReglaNegocioException("Usuario no encontrado."));

        usuario.setPassword(passwordEncoder.encode(req.getNuevaPassword()));
        usuarioRepository.save(usuario);
        codigosActivos.remove(email);

        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente. Ya puedes iniciar sesión."));
    }

    @PostMapping("/email/enviar-codigo")
    public ResponseEntity<?> enviarCodigoEmail(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String nombre = body.getOrDefault("nombre", "usuario").trim();

        if (email.isBlank()) {
            throw new ReglaNegocioException("El correo electrónico es obligatorio.");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new ReglaNegocioException("Este correo ya está registrado. Inicia sesión.");
        }

        String codigo = String.format("%06d", RANDOM.nextInt(1_000_000));
        codigosActivos.put("EMAIL_" + email, new CodigoRecuperacion(codigo, LocalDateTime.now().plusMinutes(10)));

        log.info("[EMAIL OTP] Código de registro para {}: {} (válido 10 min)", email, codigo);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            throw new ReglaNegocioException("El servicio de correo no está configurado en el servidor.");
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(email);
            msg.setSubject("Pronostika - Código de verificación de cuenta");
            msg.setText("Hola " + nombre + ",\n\n"
                    + "Tu código de seguridad para completar tu registro en Pronostika es:\n\n"
                    + "    " + codigo + "\n\n"
                    + "Este código expira en 10 minutos. Si no solicitaste este registro, ignora este correo.");
            mailSender.send(msg);
            log.info("Código de verificación enviado a {}", email);
        } catch (Exception ex) {
            log.error("Error al enviar correo OTP a {}: {}", email, ex.getMessage());
            throw new ReglaNegocioException("No se pudo enviar el correo de verificación. Verifica tu dirección.");
        }

        return ResponseEntity.ok(Map.of("mensaje", "Enviamos un código de 6 dígitos a tu correo electrónico."));
    }

    @PostMapping("/email/verificar-codigo")
    public ResponseEntity<?> verificarCodigoEmail(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String codigo = body.getOrDefault("codigo", "").trim();

        CodigoRecuperacion registro = codigosActivos.get("EMAIL_" + email);
        if (registro == null || registro.expiraEn().isBefore(LocalDateTime.now())) {
            codigosActivos.remove("EMAIL_" + email);
            throw new ReglaNegocioException("El código expiró o no existe. Solicita uno nuevo.");
        }

        if (!registro.codigo().equals(codigo)) {
            throw new ReglaNegocioException("El código de verificación es incorrecto.");
        }

        codigosActivos.remove("EMAIL_" + email);
        return ResponseEntity.ok(Map.of("verificado", true, "mensaje", "Correo verificado correctamente."));
    }
}