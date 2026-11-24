package com.pronostika.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Petición para cambiar el rol de un usuario.
 */
public record CambiarRolDTO(
        @NotBlank(message = "El rol es obligatorio")
        @Pattern(regexp = "(?i)(ROLE_)?(ADMIN|ANALISTA|USUARIO)",
                message = "El rol debe ser ADMIN, ANALISTA o USUARIO")
        String rol) {
}
