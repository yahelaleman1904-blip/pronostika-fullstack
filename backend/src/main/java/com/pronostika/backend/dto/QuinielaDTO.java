package com.pronostika.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.pronostika.backend.entity.Quiniela;

/**
 * Detalle de una quiniela con todos sus partidos.
 */
public record QuinielaDTO(
        Long id,
        String nombreJornada,
        Integer puntosTotales,
        LocalDateTime createdAt,
        int totalPartidos,
        List<QuinielaPartidoDTO> partidos) {

    public static QuinielaDTO desde(Quiniela q) {
        List<QuinielaPartidoDTO> partidos = q.getPartidos().stream()
                .map(QuinielaPartidoDTO::desde)
                .toList();
        return new QuinielaDTO(
                q.getId(),
                q.getNombreJornada(),
                q.getPuntosTotales(),
                q.getCreatedAt(),
                partidos.size(),
                partidos);
    }
}
