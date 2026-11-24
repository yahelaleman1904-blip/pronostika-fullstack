package com.pronostika.backend.service;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pronostika.backend.dto.ActualizarUsuarioAdminDTO;
import com.pronostika.backend.dto.CambiarRolDTO;
import com.pronostika.backend.dto.CrearUsuarioAdminDTO;
import com.pronostika.backend.dto.PaginaDTO;
import com.pronostika.backend.dto.RolUtil;
import com.pronostika.backend.dto.UsuarioAdminDTO;
import com.pronostika.backend.entity.Rol;
import com.pronostika.backend.entity.Usuario;
import com.pronostika.backend.exception.RecursoNoEncontradoException;
import com.pronostika.backend.exception.ReglaNegocioException;
import com.pronostika.backend.repository.RolRepository;
import com.pronostika.backend.repository.UsuarioRepository;

/**
 * Lógica del módulo de administración de usuarios.
 */
@Service
@Transactional(readOnly = true)
public class AdminUserService {

    private static final String ROL_POR_DEFECTO = "USUARIO";
    private static final Set<String> CAMPOS_ORDENABLES = Set.of("id", "nombre", "apellido", "email", "createdAt");
    private static final int TAMANIO_MAXIMO = 50;

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            ObjectProvider<PasswordEncoder> passwordEncoderProvider) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        // Usa el PasswordEncoder del módulo de seguridad si existe; si no, BCrypt.
        this.passwordEncoder = passwordEncoderProvider.getIfAvailable(BCryptPasswordEncoder::new);
    }

    public PaginaDTO<UsuarioAdminDTO> listar(String buscar, Pageable pageable) {
        String texto = buscar == null ? "" : buscar.trim();
        return PaginaDTO.de(usuarioRepository.buscar(texto, ordenSeguro(pageable)), UsuarioAdminDTO::desde);
    }

    /** Solo permite ordenar por columnas visibles en la tabla del panel. */
    private static Pageable ordenSeguro(Pageable pageable) {
        List<Sort.Order> ordenes = pageable.getSort().stream()
                .filter(o -> CAMPOS_ORDENABLES.contains(o.getProperty()))
                .toList();
        Sort sort = ordenes.isEmpty() ? Sort.by("id") : Sort.by(ordenes);
        int tamanio = Math.min(pageable.getPageSize(), TAMANIO_MAXIMO);
        return PageRequest.of(pageable.getPageNumber(), tamanio, sort);
    }

    public UsuarioAdminDTO obtener(Long id) {
        return UsuarioAdminDTO.desde(buscarUsuario(id));
    }

    public List<String> roles() {
        return rolRepository.findAll().stream()
                .map(r -> RolUtil.sinPrefijo(r.getNombre()))
                .toList();
    }

    @Transactional
    public UsuarioAdminDTO crear(CrearUsuarioAdminDTO dto) {
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ReglaNegocioException("Ya existe un usuario con el correo " + email);
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(dto.nombre().trim());
        usuario.setApellido(dto.apellido().trim());
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(dto.password()));
        usuario.setTelefono(vacioANull(dto.telefono()));
        usuario.setRol(buscarRol(dto.rol() == null || dto.rol().isBlank() ? ROL_POR_DEFECTO : dto.rol()));
        usuario.setActivo(Boolean.TRUE);
        return UsuarioAdminDTO.desde(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioAdminDTO actualizar(Long id, ActualizarUsuarioAdminDTO dto) {
        Usuario usuario = buscarUsuario(id);
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new ReglaNegocioException("El correo " + email + " ya está en uso por otro usuario");
        }
        usuario.setNombre(dto.nombre().trim());
        usuario.setApellido(dto.apellido().trim());
        usuario.setEmail(email);
        usuario.setTelefono(vacioANull(dto.telefono()));
        usuario.setActivo(dto.activo());
        return UsuarioAdminDTO.desde(usuario);
    }

    @Transactional
    public UsuarioAdminDTO cambiarRol(Long id, CambiarRolDTO dto, String emailAdmin) {
        Usuario usuario = buscarUsuario(id);
        Rol nuevoRol = buscarRol(dto.rol());
        if (usuario.getEmail().equalsIgnoreCase(emailAdmin)
                && !"ROLE_ADMIN".equals(nuevoRol.getNombre())) {
            throw new ReglaNegocioException("No puedes quitarte a ti mismo el rol de administrador");
        }
        usuario.setRol(nuevoRol);
        return UsuarioAdminDTO.desde(usuario);
    }

    @Transactional
    public void eliminar(Long id, String emailAdmin) {
        Usuario usuario = buscarUsuario(id);
        if (usuario.getEmail().equalsIgnoreCase(emailAdmin)) {
            throw new ReglaNegocioException("No puedes eliminar tu propia cuenta desde el panel de administración");
        }
        usuarioRepository.delete(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findWithRolById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + id));
    }

    private Rol buscarRol(String nombre) {
        String nombreBd = RolUtil.conPrefijo(nombre);
        return rolRepository.findByNombre(nombreBd)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el rol " + nombre));
    }

    private static String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
