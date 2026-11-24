package com.pronostika.backend.dto;

import java.time.LocalDateTime;

import com.pronostika.backend.entity.Usuario;

/**
 * Perfil del usuario autenticado.
 */
public record PerfilDTO(
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,
        String avatarUrl,
        String rol,
        LocalDateTime createdAt) {

    public static PerfilDTO desde(Usuario u) {
        return new PerfilDTO(
                u.getId(),
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getTelefono(),
                u.getAvatarUrl(),
                RolUtil.sinPrefijo(u.getRol().getNombre()),
                u.getCreatedAt());
    }
}
