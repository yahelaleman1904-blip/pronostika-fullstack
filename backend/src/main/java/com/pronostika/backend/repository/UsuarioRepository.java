package com.pronostika.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pronostika.backend.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @EntityGraph(attributePaths = "rol")
    Optional<Usuario> findByEmail(String email);

    @EntityGraph(attributePaths = "rol")
    Optional<Usuario> findWithRolById(Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    /**
     * Búsqueda paginada por nombre, apellido o correo (sin distinguir mayúsculas).
     * Si el texto viene vacío regresa todos los usuarios.
     */
    @EntityGraph(attributePaths = "rol")
    @Query(value = """
            SELECT u FROM Usuario u
            WHERE :texto = ''
               OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
               OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :texto, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :texto, '%'))
            """,
            countQuery = """
            SELECT COUNT(u) FROM Usuario u
            WHERE :texto = ''
               OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
               OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :texto, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :texto, '%'))
            """)
    Page<Usuario> buscar(@Param("texto") String texto, Pageable pageable);
}
