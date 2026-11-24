package com.pronostika.backend.repository;

import com.pronostika.backend.entity.Pronostico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PronosticoRepository extends JpaRepository<Pronostico, Long> {
    @EntityGraph(attributePaths = {"partido", "partido.liga", "usuario"})
    @Query("SELECT p FROM Pronostico p WHERE " +
           "(:search IS NULL OR LOWER(p.partido.equipoLocal) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.partido.equipoVisitante) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.ganadorPrevisto) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:liga IS NULL OR p.partido.liga.nombre = :liga)")
    Page<Pronostico> buscarConFiltros(@Param("search") String search, @Param("liga") String liga, Pageable pageable);
}