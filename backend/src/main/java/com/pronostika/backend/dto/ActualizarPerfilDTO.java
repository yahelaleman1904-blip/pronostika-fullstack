package com.pronostika.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos que el usuario puede cambiar desde su perfil: el teléfono para
 * recibir SMS/WhatsApp y la URL de su avatar. Enviar "" borra el valor.
 */
public record ActualizarPerfilDTO(
        @Pattern(regexp = "^$|^\\+?[0-9]{10,15}$",
                message = "El teléfono debe tener de 10 a 15 dígitos, con + opcional (ej. +529511234567)")
        String telefono,

        @Size(max = 255, message = "La URL del avatar admite máximo 255 caracteres")
        @Pattern(regexp = "^$|^https?://.+", message = "La URL del avatar debe iniciar con http:// o https://")
        String avatarUrl) {
}
