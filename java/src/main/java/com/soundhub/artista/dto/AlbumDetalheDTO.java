package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Album;

/** Versao completa do album, com a quantidade de musicas. */
public record AlbumDetalheDTO(
        Long id,
        String titulo,
        Integer anoLancamento,
        Long artistaId,
        String artistaNome,
        long totalMusicas
) {
    public static AlbumDetalheDTO from(Album album, long totalMusicas) {
        return new AlbumDetalheDTO(
                album.getId(),
                album.getTitulo(),
                album.getAnoLancamento(),
                album.getArtista().getId(),
                album.getArtista().getNomeArtistico(),
                totalMusicas);
    }
}
