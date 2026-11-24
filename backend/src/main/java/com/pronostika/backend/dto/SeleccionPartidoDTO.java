package com.pronostika.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

/**
 * Selección del usuario para un partido dentro de la quiniela.
 */
public record SeleccionPartidoDTO(
        @NotNull(message = "El id del partido es obligatorio")
        @Positive(message = "El id del partido debe ser positivo")
        Long partidoId,

        @NotBlank(message = "La selección es obligatoria")
        @Pattern(regexp = "(?i)LOCAL|EMPATE|VISITA", message = "La selección debe ser LOCAL, EMPATE o VISITA")
        String seleccion) {
}
