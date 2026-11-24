package com.pronostika.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pronostika.backend.entity.Quiniela;

public interface QuinielaRepository extends JpaRepository<Quiniela, Long> {

    Page<Quiniela> findByUsuarioEmail(String email, Pageable pageable);

    @EntityGraph(attributePaths = { "usuario", "partidos", "partidos.partido" })
    Optional<Quiniela> findDetalleById(Long id);
}
