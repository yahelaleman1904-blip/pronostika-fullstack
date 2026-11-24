package com.pronostika.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Activa @PreAuthorize en los controladores (por ejemplo, el módulo Admin
 * usa hasRole('ADMIN'), que corresponde al rol ROLE_ADMIN de la tabla roles).
 *
 * La cadena de filtros JWT y las rutas públicas se configuran en la
 * clase de seguridad del módulo de autenticación.
 */
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
}
