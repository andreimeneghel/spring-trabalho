package com.soundhub.musica.dto;

import com.soundhub.musica.entity.Categoria;

/** Versao completa, com quantas musicas usam a categoria. */
public record CategoriaDetalheDTO(
        Long id,
        String nome,
        long totalMusicas
) {
    public static CategoriaDetalheDTO from(Categoria categoria, long totalMusicas) {
        return new CategoriaDetalheDTO(categoria.getId(), categoria.getNome(), totalMusicas);
    }
}
