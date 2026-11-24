package com.pronostika.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/**
 * Petición para guardar una quiniela con sus partidos (relación N:M).
 */
public record CrearQuinielaDTO(
        @NotBlank(message = "El nombre de la jornada es obligatorio")
        @Size(max = 100, message = "El nombre de la jornada admite máximo 100 caracteres")
        String nombreJornada,

        @NotEmpty(message = "La quiniela debe incluir al menos un partido")
        @Size(max = 30, message = "La quiniela admite máximo 30 partidos")
        List<@Valid SeleccionPartidoDTO> selecciones) {
}
