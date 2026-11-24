package com.pronostika.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

/**
 * Envío de notificaciones por SMS y WhatsApp con Twilio.
 *
 * Las credenciales se leen de application.properties (twilio.*). Si faltan
 * o siguen con los valores de ejemplo, el servicio solo registra un aviso
 * en el log y regresa false, sin interrumpir el flujo que lo llamó.
 */
@Service
public class TwilioService {

    private static final Logger log = LoggerFactory.getLogger(TwilioService.class);
    private static final String PREFIJO_WHATSAPP = "whatsapp:";

    private final String accountSid;
    private final String authToken;
    private final String phoneNumber;
    private final String whatsappNumber;

    private volatile boolean inicializado = false;

    public TwilioService(
            @Value("${twilio.account-sid:}") String accountSid,
            @Value("${twilio.auth-token:}") String authToken,
            @Value("${twilio.phone-number:}") String phoneNumber,
            @Value("${twilio.whatsapp-number:}") String whatsappNumber) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.phoneNumber = phoneNumber;
        this.whatsappNumber = whatsappNumber;
    }

    /**
     * Envía un SMS. Regresa true si Twilio aceptó el mensaje.
     */
    public boolean enviarSms(String destino, String mensaje) {
        if (!estaConfigurado() || esVacio(phoneNumber)) {
            log.warn("Twilio sin configurar: no se envió el SMS a {}", ocultar(destino));
            return false;
        }
        return enviar(normalizar(destino), phoneNumber, mensaje, "SMS");
    }

    /**
     * Envía un mensaje de WhatsApp. El destino puede venir con o sin el
     * prefijo "whatsapp:".
     */
    public boolean enviarWhatsapp(String destino, String mensaje) {
        if (!estaConfigurado() || esVacio(whatsappNumber)) {
            log.warn("Twilio sin configurar: no se envió el WhatsApp a {}", ocultar(destino));
            return false;
        }
        String para = conPrefijoWhatsapp(normalizar(destino));
        String desde = conPrefijoWhatsapp(whatsappNumber.trim());
        return enviar(para, desde, mensaje, "WhatsApp");
    }

    public boolean estaConfigurado() {
        return !esVacio(accountSid) && !esVacio(authToken)
                && !accountSid.startsWith("TU_") && !authToken.startsWith("TU_");
    }

    private boolean enviar(String para, String desde, String mensaje, String canal) {
        if (esVacio(para) || esVacio(mensaje)) {
            log.warn("{} no enviado: destino o mensaje vacío", canal);
            return false;
        }
        try {
            inicializar();
            Message enviado = Message.creator(new PhoneNumber(para), new PhoneNumber(desde), mensaje).create();
            log.info("{} enviado a {} (sid {})", canal, ocultar(para), enviado.getSid());
            return true;
        } catch (RuntimeException ex) {
            log.error("Error al enviar {} a {}: {}", canal, ocultar(para), ex.getMessage());
            return false;
        }
    }

    private void inicializar() {
        if (!inicializado) {
            synchronized (this) {
                if (!inicializado) {
                    Twilio.init(accountSid, authToken);
                    inicializado = true;
                }
            }
        }
    }

    private static String normalizar(String numero) {
        return numero == null ? null : numero.replaceAll("[\\s()-]", "");
    }

    private static String conPrefijoWhatsapp(String numero) {
        if (numero == null) {
            return null;
        }
        return numero.startsWith(PREFIJO_WHATSAPP) ? numero : PREFIJO_WHATSAPP + numero;
    }

    private static boolean esVacio(String valor) {
        return valor == null || valor.isBlank();
    }

    /** Muestra solo los últimos 4 dígitos en el log. */
    private static String ocultar(String numero) {
        if (numero == null || numero.length() < 4) {
            return "****";
        }
        return "****" + numero.substring(numero.length() - 4);
    }
}
