package com.pronostika.backend.repository;

import com.pronostika.backend.entity.Liga;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LigaRepository extends JpaRepository<Liga, Long> {
    Optional<Liga> findByNombre(String nombre);
}