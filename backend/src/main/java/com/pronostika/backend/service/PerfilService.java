package com.pronostika.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pronostika.backend.dto.ActualizarPerfilDTO;
import com.pronostika.backend.dto.PerfilDTO;
import com.pronostika.backend.entity.Usuario;
import com.pronostika.backend.exception.RecursoNoEncontradoException;
import com.pronostika.backend.repository.UsuarioRepository;

/**
 * Consulta y edición del perfil del usuario autenticado.
 */
@Service
@Transactional(readOnly = true)
public class PerfilService {

    private final UsuarioRepository usuarioRepository;

    public PerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public PerfilDTO obtener(String email) {
        return PerfilDTO.desde(buscar(email));
    }

    @Transactional
    public PerfilDTO actualizar(String email, ActualizarPerfilDTO dto) {
        Usuario usuario = buscar(email);
        if (dto.telefono() != null) {
            usuario.setTelefono(dto.telefono().isBlank() ? null : dto.telefono().trim());
        }
        if (dto.avatarUrl() != null) {
            usuario.setAvatarUrl(dto.avatarUrl().isBlank() ? null : dto.avatarUrl().trim());
        }
        return PerfilDTO.desde(usuario);
    }

    private Usuario buscar(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario " + email));
    }
}
