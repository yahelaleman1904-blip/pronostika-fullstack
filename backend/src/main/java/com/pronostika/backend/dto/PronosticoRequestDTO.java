package com.pronostika.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PronosticoRequestDTO {
    @NotNull(message = "El partido es obligatorio")
    private Long partidoId;

    @NotBlank(message = "El ganador previsto es obligatorio")
    private String ganadorPrevisto;

    @NotNull @Min(1) @Max(99)
    private Integer probabilidad;

    private String estado = "PENDIENTE";
}