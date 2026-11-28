package com.pronostika.backend.dto;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.pronostika.backend.entity.Partido;
import com.pronostika.backend.entity.Quiniela;

import static org.junit.jupiter.api.Assertions.assertEquals;

class QuinielaDtoTest {

    @Test
    void mapeaQuinielaYPartidosADtosCorrectamente() {
        Partido partido = new Partido();
        partido.setId(1L);
        partido.setEquipoLocal("America");
        partido.setEquipoVisitante("Guadalajara");
        partido.setFechaPartido(LocalDateTime.of(2026, 11, 28, 20, 0));
        partido.setEstado("PENDIENTE");

        Quiniela quiniela = new Quiniela();
        quiniela.setId(10L);
        quiniela.setNombreJornada("Jornada 12");
        quiniela.setPuntosTotales(3);
        quiniela.agregarPartido(partido, "LOCAL");

        QuinielaDTO detalle = QuinielaDTO.desde(quiniela);
        QuinielaResumenDTO resumen = QuinielaResumenDTO.desde(quiniela);

        assertEquals(10L, detalle.id());
        assertEquals("Jornada 12", detalle.nombreJornada());
        assertEquals(1, detalle.totalPartidos());
        assertEquals("LOCAL", detalle.partidos().get(0).seleccion());
        assertEquals("America", detalle.partidos().get(0).equipoLocal());

        assertEquals(10L, resumen.id());
        assertEquals(1, resumen.totalPartidos());
        assertEquals(3, resumen.puntosTotales());
    }
}
