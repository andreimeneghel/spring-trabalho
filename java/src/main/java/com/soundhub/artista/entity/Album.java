package com.soundhub.artista.entity;

import jakarta.persistence.*;
import lombok.*;

/** Estrutura base (parte do Gustavo). Ver comentario em {@link Artista}. */
@Entity
@Table(name = "album")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(name = "ano_lancamento")
    private Integer anoLancamento;

    /** Capa do album como data URI em base64. Null quando nao tem capa. */
    @Column(columnDefinition = "TEXT")
    private String capa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artista artista;
}
