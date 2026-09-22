package com.soundhub.avaliacao.dto;

/** Resumo das notas de uma musica. */
public record MediaAvaliacaoDTO(
        Long musicaId,
        String musicaTitulo,
        /** Media arredondada em 2 casas. Vem 0.0 quando a musica ainda nao foi avaliada. */
        double media,
        long totalAvaliacoes
) {
    public static MediaAvaliacaoDTO of(Long musicaId, String musicaTitulo, Double media, long total) {
        double valor = media == null ? 0.0 : Math.round(media * 100.0) / 100.0;
        return new MediaAvaliacaoDTO(musicaId, musicaTitulo, valor, total);
    }
}
