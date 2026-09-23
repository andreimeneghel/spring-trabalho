package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Album;

/** Versao curta, usada nas listagens e dentro do detalhe do artista. */
public record AlbumResumoDTO(
        Long id,
        String titulo,
        Integer anoLancamento,
        /** Data URI em base64, ou null. */
        String capa,
        Long artistaId,
        String artistaNome
) {
    public static AlbumResumoDTO from(Album album) {
        return new AlbumResumoDTO(
                album.getId(),
                album.getTitulo(),
                album.getAnoLancamento(),
                album.getCapa(),
                album.getArtista().getId(),
                album.getArtista().getNomeArtistico());
    }
}
