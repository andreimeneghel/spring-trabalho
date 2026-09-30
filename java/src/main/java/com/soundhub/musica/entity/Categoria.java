package com.soundhub.musica.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Categoria musical (parte do Douglas).
 *
 * Tabela de apoio compartilhada: nao tem dono, e a mesma categoria e usada pelas
 * musicas de qualquer artista. O lado inverso do N:N (as musicas da categoria)
 * nao e mapeado de proposito — quem precisa contar usa
 * {@code CategoriaRepository.contarMusicas}, evitando carregar a colecao inteira.
 */
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
