package com.pronostika.backend.dto;

import java.time.LocalDateTime;

import com.pronostika.backend.entity.Quiniela;

/**
 * Fila del listado de quinielas (sin el detalle de partidos).
 */
public record QuinielaResumenDTO(
        Long id,
        String nombreJornada,
        Integer puntosTotales,
        LocalDateTime createdAt,
        int totalPartidos) {

    public static QuinielaResumenDTO desde(Quiniela q) {
        return new QuinielaResumenDTO(
                q.getId(),
                q.getNombreJornada(),
                q.getPuntosTotales(),
                q.getCreatedAt(),
                q.getPartidos().size());
    }
}
