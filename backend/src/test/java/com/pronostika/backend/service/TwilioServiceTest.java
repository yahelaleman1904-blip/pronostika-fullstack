package com.pronostika.backend.service;

import java.lang.reflect.Method;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TwilioServiceTest {

    @Test
    void detectaCredencialesSinConfigurarOEjemplo() {
        TwilioService vacio = new TwilioService("", "", "", "");
        TwilioService ejemplo = new TwilioService(
                "TU_TWILIO_ACCOUNT_SID", "TU_TWILIO_AUTH_TOKEN", "+10000000000", "whatsapp:+14155238886");
        TwilioService valido = new TwilioService(
                "AC1234567890", "token_real_prueba", "+15005550006", "whatsapp:+14155238886");

        assertFalse(vacio.estaConfigurado());
        assertFalse(ejemplo.estaConfigurado());
        assertTrue(valido.estaConfigurado());
        assertFalse(vacio.enviarSms("9511234567", "hola"));
        assertFalse(vacio.enviarWhatsapp("9511234567", "hola"));
    }

    @Test
    void normalizaNumerosMexicanosParaWhatsappYSms() throws Exception {
        Method toWa = TwilioService.class.getDeclaredMethod("normalizarParaWhatsapp", String.class);
        toWa.setAccessible(true);

        Method toSms = TwilioService.class.getDeclaredMethod("normalizarParaSms", String.class);
        toSms.setAccessible(true);

        assertEquals("+5219511234567", toWa.invoke(null, "9511234567"));
        assertEquals("+5219511234567", toWa.invoke(null, "+529511234567"));
        assertEquals("+5219511234567", toWa.invoke(null, "+5219511234567"));
        assertEquals("+5219511234567", toWa.invoke(null, "whatsapp:+52 951-123-4567"));

        assertEquals("+529511234567", toSms.invoke(null, "9511234567"));
        assertEquals("+529511234567", toSms.invoke(null, "+5219511234567"));
    }
}
