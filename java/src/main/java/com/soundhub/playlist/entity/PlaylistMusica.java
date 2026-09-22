package com.soundhub.playlist.entity;

import com.soundhub.musica.entity.Musica;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Ligacao N:N entre Playlist e Musica.
 *
 * Virou entidade (em vez de um @ManyToMany simples) porque a tabela guarda
 * atributos proprios: a ordem da musica na playlist e quando ela foi adicionada.
 */
@Entity
@Table(name = "playlist_musica")
@IdClass(PlaylistMusica.PlaylistMusicaId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistMusica {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "musica_id", nullable = false)
    private Musica musica;

    /** Posicao da musica na playlist, comecando em 0. */
    @Column(nullable = false)
    private Integer ordem;

    @Column(name = "adicionada_em", nullable = false, updatable = false)
    private LocalDateTime adicionadaEm;

    @PrePersist
    void aoCriar() {
        adicionadaEm = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlaylistMusica outro)) return false;
        return Objects.equals(idPlaylist(), outro.idPlaylist())
                && Objects.equals(idMusica(), outro.idMusica());
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPlaylist(), idMusica());
    }

    private Long idPlaylist() {
        return playlist == null ? null : playlist.getId();
    }

    private Long idMusica() {
        return musica == null ? null : musica.getId();
    }

    /** Chave composta exigida pelo JPA (@IdClass). */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class PlaylistMusicaId implements Serializable {
        private Long playlist;
        private Long musica;
    }
}
