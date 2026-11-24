package com.pronostika.backend.dto;

/**
 * Conversión entre el nombre guardado en la tabla roles (ROLE_ADMIN)
 * y el que se usa en la API (ADMIN).
 */
public final class RolUtil {

    public static final String PREFIJO = "ROLE_";

    private RolUtil() {
    }

    public static String sinPrefijo(String nombre) {
        if (nombre == null) {
            return null;
        }
        return nombre.startsWith(PREFIJO) ? nombre.substring(PREFIJO.length()) : nombre;
    }

    public static String conPrefijo(String nombre) {
        String limpio = nombre.trim().toUpperCase();
        return limpio.startsWith(PREFIJO) ? limpio : PREFIJO + limpio;
    }
}
