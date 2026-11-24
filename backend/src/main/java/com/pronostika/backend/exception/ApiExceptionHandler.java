package com.pronostika.backend.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.pronostika.backend.dto.ErrorResponseDTO;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Convierte las excepciones de los módulos en respuestas JSON uniformes
 * (400, 401, 403, 404 y 409).
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> validacion(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return respuesta(HttpStatus.BAD_REQUEST, "Hay datos inválidos en la petición", req, campos);
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class })
    public ResponseEntity<ErrorResponseDTO> peticionMalFormada(Exception ex, HttpServletRequest req) {
        return respuesta(HttpStatus.BAD_REQUEST, "El cuerpo o los parámetros de la petición no son válidos", req, null);
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponseDTO> noEncontrado(RecursoNoEncontradoException ex, HttpServletRequest req) {
        return respuesta(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponseDTO> reglaNegocio(ReglaNegocioException ex, HttpServletRequest req) {
        return respuesta(HttpStatus.CONFLICT, ex.getMessage(), req, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> noAutenticado(AuthenticationException ex, HttpServletRequest req) {
        return respuesta(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión para acceder a este recurso", req, null);
    }

    @ExceptionHandler({ AccessDeniedException.class, AuthorizationDeniedException.class })
    public ResponseEntity<ErrorResponseDTO> sinPermiso(Exception ex, HttpServletRequest req) {
        return respuesta(HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción", req, null);
    }

    private ResponseEntity<ErrorResponseDTO> respuesta(HttpStatus status, String mensaje,
            HttpServletRequest req, Map<String, String> campos) {
        ErrorResponseDTO cuerpo = new ErrorResponseDTO(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                mensaje,
                req.getRequestURI(),
                campos);
        return ResponseEntity.status(status).body(cuerpo);
    }
}
