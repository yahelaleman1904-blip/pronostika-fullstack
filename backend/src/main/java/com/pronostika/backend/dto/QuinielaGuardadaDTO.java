package com.pronostika.backend.dto;

/**
 * Respuesta al guardar una quiniela: el detalle y si se pudieron
 * enviar las confirmaciones por SMS y WhatsApp.
 */
public record QuinielaGuardadaDTO(
        QuinielaDTO quiniela,
        boolean smsEnviado,
        boolean whatsappEnviado) {
}
