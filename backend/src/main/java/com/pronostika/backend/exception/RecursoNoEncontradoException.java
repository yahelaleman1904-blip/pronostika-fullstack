package com.pronostika.backend.exception;

/**
 * Se lanza cuando un registro solicitado no existe (respuesta 404).
 */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
