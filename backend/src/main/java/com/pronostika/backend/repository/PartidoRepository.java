package com.pronostika.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pronostika.backend.entity.Partido;

public interface PartidoRepository extends JpaRepository<Partido, Long> {
}
