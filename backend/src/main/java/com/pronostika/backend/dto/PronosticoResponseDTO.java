package com.pronostika.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PronosticoResponseDTO {
    private Long id;
    private Long partidoId;
    private String tituloPartido;
    private String liga;
    private LocalDateTime fechaPartido;
    private String ganadorPrevisto;
    private Integer probabilidad;
    private String estado;

    public PronosticoResponseDTO(Long id, Long partidoId, String tituloPartido, String liga,
                                 LocalDateTime fechaPartido, String ganadorPrevisto,
                                 Integer probabilidad, String estado) {
        this.id = id;
        this.partidoId = partidoId;
        this.tituloPartido = tituloPartido;
        this.liga = liga;
        this.fechaPartido = fechaPartido;
        this.ganadorPrevisto = ganadorPrevisto;
        this.probabilidad = probabilidad;
        this.estado = estado;
    }
}