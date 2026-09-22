package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Artista;

import java.util.List;

/** Versao completa: os dados do artista, as contagens e os albuns dele. */
public record ArtistaDetalheDTO(
        Long id,
        String nomeArtistico,
        String biografia,
        Long usuarioId,
        String usuarioNome,
        long totalAlbuns,
        long totalMusicas,
        List<AlbumResumoDTO> albuns
) {
    public static ArtistaDetalheDTO from(Artista artista,
                                         long totalMusicas,
                                         List<AlbumResumoDTO> albuns) {
        return new ArtistaDetalheDTO(
                artista.getId(),
                artista.getNomeArtistico(),
                artista.getBiografia(),
                artista.getUsuario().getId(),
                artista.getUsuario().getNome(),
                albuns.size(),
                totalMusicas,
                albuns);
    }
}
