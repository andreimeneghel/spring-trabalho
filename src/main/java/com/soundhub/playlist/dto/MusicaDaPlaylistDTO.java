package com.soundhub.playlist.dto;

import com.soundhub.musica.entity.Musica;
import com.soundhub.playlist.entity.PlaylistMusica;

/** Como cada musica aparece dentro do detalhe de uma playlist. */
public record MusicaDaPlaylistDTO(
        Long musicaId,
        String titulo,
        Integer duracao,
        String artista,
        Integer ordem
) {
    public static MusicaDaPlaylistDTO from(PlaylistMusica pm) {
        Musica musica = pm.getMusica();
        return new MusicaDaPlaylistDTO(
                musica.getId(),
                musica.getTitulo(),
                musica.getDuracao(),
                musica.getArtista() == null ? null : musica.getArtista().getNomeArtistico(),
                pm.getOrdem());
    }
}
