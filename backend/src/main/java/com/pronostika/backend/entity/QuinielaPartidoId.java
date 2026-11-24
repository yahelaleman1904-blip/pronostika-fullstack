package com.pronostika.backend.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Llave primaria compuesta (quiniela_id, partido_id) de la tabla pivote.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class QuinielaPartidoId implements Serializable {

    @Column(name = "quiniela_id")
    private Long quinielaId;

    @Column(name = "partido_id")
    private Long partidoId;
}
