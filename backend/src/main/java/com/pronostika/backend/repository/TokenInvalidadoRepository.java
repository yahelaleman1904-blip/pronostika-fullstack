package com.pronostika.backend.repository;

import com.pronostika.backend.entity.TokenInvalidado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenInvalidadoRepository extends JpaRepository<TokenInvalidado, Long> {
    boolean existsByToken(String token);
}