package com.soundhub.playlist.dto;

import com.soundhub.playlist.entity.Playlist;

import java.time.LocalDateTime;

/** Versao curta, usada nas listagens (nao carrega as musicas). */
public record PlaylistResumoDTO(
        Long id,
        String nome,
        String descricao,
        boolean publica,
        LocalDateTime criadaEm,
        Long donoId,
        String donoNome,
        int totalMusicas
) {
    public static PlaylistResumoDTO from(Playlist playlist) {
        return new PlaylistResumoDTO(
                playlist.getId(),
                playlist.getNome(),
                playlist.getDescricao(),
                playlist.isPublica(),
                playlist.getCriadaEm(),
                playlist.getUsuario().getId(),
                playlist.getUsuario().getNome(),
                playlist.getMusicas().size());
    }
}
