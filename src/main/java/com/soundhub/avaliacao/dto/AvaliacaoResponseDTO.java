package com.soundhub.avaliacao.dto;

import com.soundhub.avaliacao.entity.Avaliacao;

import java.time.LocalDateTime;

public record AvaliacaoResponseDTO(
        Long id,
        Short nota,
        String comentario,
        LocalDateTime criadaEm,
        LocalDateTime atualizadaEm,
        Long usuarioId,
        String usuarioNome,
        Long musicaId,
        String musicaTitulo
) {
    public static AvaliacaoResponseDTO from(Avaliacao avaliacao) {
        return new AvaliacaoResponseDTO(
                avaliacao.getId(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getCriadaEm(),
                avaliacao.getAtualizadaEm(),
                avaliacao.getUsuario().getId(),
                avaliacao.getUsuario().getNome(),
                avaliacao.getMusica().getId(),
                avaliacao.getMusica().getTitulo());
    }
}
