package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Album;

/** Versao completa do album, com a quantidade de musicas. */
public record AlbumDetalheDTO(
        Long id,
        String titulo,
        Integer anoLancamento,
        /** Data URI em base64, ou null. */
        String capa,
        Long artistaId,
        String artistaNome,
        long totalMusicas
) {
    public static AlbumDetalheDTO from(Album album, long totalMusicas) {
        return new AlbumDetalheDTO(
                album.getId(),
                album.getTitulo(),
                album.getAnoLancamento(),
                album.getCapa(),
                album.getArtista().getId(),
                album.getArtista().getNomeArtistico(),
                totalMusicas);
    }
}
