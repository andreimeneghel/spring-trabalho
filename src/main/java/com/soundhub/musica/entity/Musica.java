package com.soundhub.musica.entity;

import com.soundhub.artista.entity.Album;
import com.soundhub.artista.entity.Artista;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/** Estrutura base (parte do Douglas). Ver comentario em {@link Artista}. */
@Entity
@Table(name = "musica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Musica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    /** Duracao em segundos. */
    @Column(nullable = false)
    private Integer duracao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artista_id", nullable = false)
    private Artista artista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "musica_categoria",
            joinColumns = @JoinColumn(name = "musica_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id"))
    @Builder.Default
    private Set<Categoria> categorias = new HashSet<>();
}
