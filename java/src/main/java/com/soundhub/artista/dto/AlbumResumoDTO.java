package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Album;

/** Versao curta, usada nas listagens e dentro do detalhe do artista. */
public record AlbumResumoDTO(
        Long id,
        String titulo,
        Integer anoLancamento,
        Long artistaId,
        String artistaNome
) {
    public static AlbumResumoDTO from(Album album) {
        return new AlbumResumoDTO(
                album.getId(),
                album.getTitulo(),
                album.getAnoLancamento(),
                album.getArtista().getId(),
                album.getArtista().getNomeArtistico());
    }
}
