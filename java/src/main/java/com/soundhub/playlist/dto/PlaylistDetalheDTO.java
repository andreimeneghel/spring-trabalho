package com.soundhub.playlist.dto;

import com.soundhub.playlist.entity.Playlist;

import com.soundhub.playlist.entity.PlaylistMusica;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/** Versao completa: os dados da playlist mais as musicas, na ordem. */
public record PlaylistDetalheDTO(
        Long id,
        String nome,
        String descricao,
        boolean publica,
        /** Data URI em base64, ou null quando a playlist nao tem capa. */
        String capa,
        LocalDateTime criadaEm,
        Long donoId,
        String donoNome,
        int totalMusicas,
        /** Soma da duracao de todas as musicas, em segundos. */
        int duracaoTotal,
        List<MusicaDaPlaylistDTO> musicas
) {
    public static PlaylistDetalheDTO from(Playlist playlist) {
        List<MusicaDaPlaylistDTO> musicas = playlist.getMusicas().stream()
                .sorted(Comparator.comparing(PlaylistMusica::getOrdem))
                .map(MusicaDaPlaylistDTO::from)
                .toList();

        return new PlaylistDetalheDTO(
                playlist.getId(),
                playlist.getNome(),
                playlist.getDescricao(),
                playlist.isPublica(),
                playlist.getCapa(),
                playlist.getCriadaEm(),
                playlist.getUsuario().getId(),
                playlist.getUsuario().getNome(),
                musicas.size(),
                playlist.getDuracaoTotal(),
                musicas);
    }
}
