package com.pronostika.backend.exception;

/**
 * Se lanza cuando la petición es válida en forma pero rompe una regla
 * del sistema, por ejemplo un correo repetido (respuesta 409).
 */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
