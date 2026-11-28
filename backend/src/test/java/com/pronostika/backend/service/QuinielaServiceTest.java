package com.pronostika.backend.service;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.pronostika.backend.dto.QuinielaDTO;
import com.pronostika.backend.dto.QuinielaPartidoDTO;

import static org.junit.jupiter.api.Assertions.assertTrue;

class QuinielaServiceTest {

    @Test
    void construyeMensajesDeConfirmacionParaSmsYWhatsapp() throws Exception {
        QuinielaPartidoDTO p1 = new QuinielaPartidoDTO(
                1L, "Real Madrid", "Barcelona", null, null,
                LocalDateTime.of(2026, 11, 29, 14, 0), "PENDIENTE", "LOCAL");
        QuinielaDTO dto = new QuinielaDTO(
                15L, "Jornada 12", 0, LocalDateTime.now(), 1, List.of(p1));

        Method smsMethod = QuinielaService.class.getDeclaredMethod("mensajeConfirmacion", String.class, QuinielaDTO.class);
        smsMethod.setAccessible(true);
        String sms = (String) smsMethod.invoke(null, "Yahel", dto);

        Method waMethod = QuinielaService.class.getDeclaredMethod("mensajeWhatsapp", String.class, QuinielaDTO.class);
        waMethod.setAccessible(true);
        String wa = (String) waMethod.invoke(null, "Yahel", dto);

        assertTrue(sms.contains("folio #15"));
        assertTrue(sms.contains("Jornada 12"));
        assertTrue(wa.contains("Real Madrid vs Barcelona"));
        assertTrue(wa.contains("*LOCAL*"));
        assertTrue(wa.contains("#15"));
    }
}
