package com.pronostika.backend.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pronostika.backend.dto.ActualizarUsuarioAdminDTO;
import com.pronostika.backend.dto.CambiarRolDTO;
import com.pronostika.backend.dto.CrearUsuarioAdminDTO;
import com.pronostika.backend.dto.PaginaDTO;
import com.pronostika.backend.dto.UsuarioAdminDTO;
import com.pronostika.backend.service.AdminUserService;

import jakarta.validation.Valid;

/**
 * Administración de usuarios. Solo accesible con ROLE_ADMIN.
 *
 * GET    /api/admin/usuarios?buscar=&page=0&size=10&sort=nombre,asc
 * GET    /api/admin/usuarios/{id}
 * GET    /api/admin/usuarios/roles
 * POST   /api/admin/usuarios
 * PUT    /api/admin/usuarios/{id}
 * PATCH  /api/admin/usuarios/{id}/rol
 * DELETE /api/admin/usuarios/{id}
 */
@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public PaginaDTO<UsuarioAdminDTO> listar(
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return adminUserService.listar(buscar, pageable);
    }

    @GetMapping("/roles")
    public List<String> roles() {
        return adminUserService.roles();
    }

    @GetMapping("/{id}")
    public UsuarioAdminDTO obtener(@PathVariable Long id) {
        return adminUserService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioAdminDTO> crear(@Valid @RequestBody CrearUsuarioAdminDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.crear(dto));
    }

    @PutMapping("/{id}")
    public UsuarioAdminDTO actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarUsuarioAdminDTO dto) {
        return adminUserService.actualizar(id, dto);
    }

    @PatchMapping("/{id}/rol")
    public UsuarioAdminDTO cambiarRol(@PathVariable Long id, @Valid @RequestBody CambiarRolDTO dto,
            Authentication authentication) {
        return adminUserService.cambiarRol(id, dto, authentication.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        adminUserService.eliminar(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
