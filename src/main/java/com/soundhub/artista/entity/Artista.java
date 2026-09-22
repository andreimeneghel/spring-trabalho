package com.soundhub.artista.entity;

import com.soundhub.avaliacao.entity.Avaliacao;
import com.soundhub.musica.entity.Musica;
import com.soundhub.playlist.entity.Playlist;
import com.soundhub.usuario.entity.Usuario;

import jakarta.persistence.*;
import lombok.*;

/**
 * Estrutura base (parte do Gustavo). Criada junto com a V2 porque Musica -> Playlist/Avaliacao
 * dependem dela. Pode ser expandida a vontade.
 */
@Entity
@Table(name = "artista")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Artista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_artistico", nullable = false, length = 100)
    private String nomeArtistico;

    @Column(length = 1000)
    private String biografia;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;
}
