package com.pronostika.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tabla partidos. Cada partido pertenece a una liga (FK liga_id).
 */
@Entity
@Table(name = "partidos")
@Getter
@Setter
@NoArgsConstructor
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "liga_id", nullable = false)
    private Liga liga;

    @Column(name = "equipo_local", nullable = false, length = 100)
    private String equipoLocal;

    @Column(name = "equipo_visitante", nullable = false, length = 100)
    private String equipoVisitante;

    @Column(name = "logo_local")
    private String logoLocal;

    @Column(name = "logo_visitante")
    private String logoVisitante;

    @Column(name = "fecha_partido", nullable = false)
    private LocalDateTime fechaPartido;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";
}
