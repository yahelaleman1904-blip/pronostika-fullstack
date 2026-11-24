package com.pronostika.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tabla pivote quiniela_partidos (N:M entre quinielas y partidos).
 * Guarda además la selección del usuario: LOCAL, EMPATE o VISITA.
 */
@Entity
@Table(name = "quiniela_partidos")
@Getter
@Setter
@NoArgsConstructor
public class QuinielaPartido {

    @EmbeddedId
    private QuinielaPartidoId id = new QuinielaPartidoId();

    @MapsId("quinielaId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiniela_id")
    private Quiniela quiniela;

    @MapsId("partidoId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partido_id")
    private Partido partido;

    @Column(nullable = false, length = 20)
    private String seleccion;

    public QuinielaPartido(Quiniela quiniela, Partido partido, String seleccion) {
        this.quiniela = quiniela;
        this.partido = partido;
        this.seleccion = seleccion;
    }
}
