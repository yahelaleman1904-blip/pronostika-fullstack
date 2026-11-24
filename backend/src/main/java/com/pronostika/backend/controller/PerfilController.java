package com.pronostika.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pronostika.backend.dto.ActualizarPerfilDTO;
import com.pronostika.backend.dto.PerfilDTO;
import com.pronostika.backend.service.PerfilService;

import jakarta.validation.Valid;

/**
 * Perfil del usuario autenticado.
 *
 * GET /api/perfil
 * PUT /api/perfil   { "telefono": "+529511234567", "avatarUrl": "https://..." }
 */
@RestController
@RequestMapping("/api/perfil")
@PreAuthorize("isAuthenticated()")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public PerfilDTO obtener(Authentication authentication) {
        return perfilService.obtener(authentication.getName());
    }

    @PutMapping
    public PerfilDTO actualizar(@Valid @RequestBody ActualizarPerfilDTO dto, Authentication authentication) {
        return perfilService.actualizar(authentication.getName(), dto);
    }
}
