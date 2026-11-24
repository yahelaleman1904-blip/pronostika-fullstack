package com.pronostika.backend.dto;

import java.time.LocalDateTime;

import com.pronostika.backend.entity.Usuario;

/**
 * Datos de un usuario que ve el administrador (nunca incluye la contraseña).
 * El rol se expone sin el prefijo ROLE_: ADMIN, ANALISTA o USUARIO.
 */
public record UsuarioAdminDTO(
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,
        String avatarUrl,
        String rol,
        Boolean activo,
        LocalDateTime createdAt) {

    public static UsuarioAdminDTO desde(Usuario u) {
        return new UsuarioAdminDTO(
                u.getId(),
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getTelefono(),
                u.getAvatarUrl(),
                RolUtil.sinPrefijo(u.getRol().getNombre()),
                u.getActivo(),
                u.getCreatedAt());
    }
}
