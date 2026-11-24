package com.pronostika.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Formato común de las respuestas de error de la API.
 */
public record ErrorResponseDTO(
        LocalDateTime timestamp,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> campos) {
}
