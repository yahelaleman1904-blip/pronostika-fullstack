package com.pronostika.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Petición del administrador para dar de alta un usuario.
 */
public record CrearUsuarioAdminDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre admite máximo 80 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 80, message = "El apellido admite máximo 80 caracteres")
        String apellido,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo admite máximo 120 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 64, message = "La contraseña debe tener entre 8 y 64 caracteres")
        String password,

        @Pattern(regexp = "^$|^\\+?[0-9]{10,15}$",
                message = "El teléfono debe tener de 10 a 15 dígitos, con + opcional")
        String telefono,

        @Pattern(regexp = "(?i)(ROLE_)?(ADMIN|ANALISTA|USUARIO)",
                message = "El rol debe ser ADMIN, ANALISTA o USUARIO")
        String rol) {
}
