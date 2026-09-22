package com.soundhub.playlist.entity;

import com.soundhub.musica.entity.Musica;
import com.soundhub.usuario.entity.Usuario;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Playlist de um usuario.
 *
 * O N:N com Musica e mapeado por {@link PlaylistMusica} (e nao por @ManyToMany)
 * porque a tabela de ligacao guarda a ordem da musica dentro da playlist.
 */
@Entity
@Table(name = "playlist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 300)
    private String descricao;

    /** Playlist privada so aparece para o dono. */
    @Column(nullable = false)
    private boolean publica;

    /** Capa como data URI em base64. Null quando a playlist nao tem capa. */
    @Column(columnDefinition = "TEXT")
    private String capa;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<PlaylistMusica> musicas = new ArrayList<>();

    @PrePersist
    void aoCriar() {
        criadaEm = LocalDateTime.now();
    }

    // ===== Metodos de apoio (mantem os dois lados da relacao coerentes) =====

    /** Adiciona a musica no fim da playlist. */
    public void adicionarMusica(Musica musica) {
        musicas.add(PlaylistMusica.builder()
                .playlist(this)
                .musica(musica)
                .ordem(proximaOrdem())
                .build());
    }

    /** @return true se a musica estava na playlist e foi removida. */
    public boolean removerMusica(Long musicaId) {
        boolean removeu = musicas.removeIf(pm -> pm.getMusica().getId().equals(musicaId));
        if (removeu) {
            reordenar();
        }
        return removeu;
    }

    public boolean contemMusica(Long musicaId) {
        return musicas.stream().anyMatch(pm -> pm.getMusica().getId().equals(musicaId));
    }

    /** Soma a duracao de todas as musicas, em segundos. */
    public int getDuracaoTotal() {
        return musicas.stream().mapToInt(pm -> pm.getMusica().getDuracao()).sum();
    }

    private int proximaOrdem() {
        return musicas.stream()
                .mapToInt(PlaylistMusica::getOrdem)
                .max()
                .orElse(-1) + 1;
    }

    /** Fecha os buracos na numeracao depois de uma remocao: 0, 1, 2... */
    private void reordenar() {
        List<PlaylistMusica> ordenadas = musicas.stream()
                .sorted(Comparator.comparingInt(PlaylistMusica::getOrdem))
                .toList();
        for (int i = 0; i < ordenadas.size(); i++) {
            ordenadas.get(i).setOrdem(i);
        }
    }
}
