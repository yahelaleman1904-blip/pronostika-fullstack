package com.pronostika.backend.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pronostika.backend.dto.CrearQuinielaDTO;
import com.pronostika.backend.dto.PaginaDTO;
import com.pronostika.backend.dto.QuinielaDTO;
import com.pronostika.backend.dto.QuinielaGuardadaDTO;
import com.pronostika.backend.dto.QuinielaResumenDTO;
import com.pronostika.backend.service.QuinielaService;

import jakarta.validation.Valid;

/**
 * Quinielas del usuario autenticado.
 *
 * GET  /api/quinielas?page=0&size=10   listado propio, más recientes primero
 * GET  /api/quinielas/{id}             detalle con partidos (dueño o ADMIN)
 * POST /api/quinielas                  guarda y envía confirmación SMS/WhatsApp
 */
@RestController
@RequestMapping("/api/quinielas")
@PreAuthorize("isAuthenticated()")
public class QuinielaController {

    private final QuinielaService quinielaService;

    public QuinielaController(QuinielaService quinielaService) {
        this.quinielaService = quinielaService;
    }

    @GetMapping
    public PaginaDTO<QuinielaResumenDTO> listar(Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        return quinielaService.listarMias(authentication.getName(), pageable);
    }

    @GetMapping("/{id}")
    public QuinielaDTO obtener(@PathVariable Long id, Authentication authentication) {
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return quinielaService.obtener(id, authentication.getName(), esAdmin);
    }

    @PostMapping
    public ResponseEntity<QuinielaGuardadaDTO> guardar(@Valid @RequestBody CrearQuinielaDTO dto,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quinielaService.guardar(authentication.getName(), dto));
    }
}
