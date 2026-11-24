package com.pronostika.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tabla quinielas. Una quiniela pertenece a un usuario y contiene
 * muchos partidos a través de la tabla pivote quiniela_partidos.
 */
@Entity
@Table(name = "quinielas")
@Getter
@Setter
@NoArgsConstructor
public class Quiniela {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nombre_jornada", nullable = false, length = 100)
    private String nombreJornada;

    @Column(name = "puntos_totales")
    private Integer puntosTotales = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "quiniela", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuinielaPartido> partidos = new ArrayList<>();

    public void agregarPartido(Partido partido, String seleccion) {
        partidos.add(new QuinielaPartido(this, partido, seleccion));
    }
}
