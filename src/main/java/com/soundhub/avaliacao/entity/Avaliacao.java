package com.soundhub.avaliacao.entity;

import com.soundhub.musica.entity.Musica;
import com.soundhub.usuario.entity.Usuario;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Avaliacao de uma musica feita por um usuario: nota de 1 a 5 e um comentario opcional.
 * Cada usuario so pode avaliar a mesma musica uma vez (constraint uk_avaliacao_usuario_musica).
 */
@Entity
@Table(name = "avaliacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Short nota;

    @Column(length = 500)
    private String comentario;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @Column(name = "atualizada_em")
    private LocalDateTime atualizadaEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "musica_id", nullable = false)
    private Musica musica;

    @PrePersist
    void aoCriar() {
        criadaEm = LocalDateTime.now();
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadaEm = LocalDateTime.now();
    }
}
