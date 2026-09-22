package com.soundhub.artista.dto;

import com.soundhub.artista.entity.Artista;

/** Versao curta, usada nas listagens (nao carrega albuns nem contagens). */
public record ArtistaResumoDTO(
        Long id,
        String nomeArtistico,
        String biografia,
        Long usuarioId,
        String usuarioNome
) {
    public static ArtistaResumoDTO from(Artista artista) {
        return new ArtistaResumoDTO(
                artista.getId(),
                artista.getNomeArtistico(),
                artista.getBiografia(),
                artista.getUsuario().getId(),
                artista.getUsuario().getNome());
    }
}
