package com.soundhub.musica.entity;

import com.soundhub.artista.entity.Artista;

import jakarta.persistence.*;
import lombok.*;

/** Estrutura base (parte do Douglas). Ver comentario em {@link Artista}. */
@Entity
@Table(name = "categoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nome;
}
