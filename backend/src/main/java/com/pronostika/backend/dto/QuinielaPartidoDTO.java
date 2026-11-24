package com.pronostika.backend.dto;

import java.time.LocalDateTime;

import com.pronostika.backend.entity.Partido;
import com.pronostika.backend.entity.QuinielaPartido;

/**
 * Un partido dentro de la quiniela con la selección del usuario.
 */
public record QuinielaPartidoDTO(
        Long partidoId,
        String equipoLocal,
        String equipoVisitante,
        String logoLocal,
        String logoVisitante,
        LocalDateTime fechaPartido,
        String estado,
        String seleccion) {

    public static QuinielaPartidoDTO desde(QuinielaPartido qp) {
        Partido p = qp.getPartido();
        return new QuinielaPartidoDTO(
                p.getId(),
                p.getEquipoLocal(),
                p.getEquipoVisitante(),
                p.getLogoLocal(),
                p.getLogoVisitante(),
                p.getFechaPartido(),
                p.getEstado(),
                qp.getSeleccion());
    }
}
