package com.soundhub.musica.dto;

import com.soundhub.musica.entity.Categoria;

/** Versao curta, usada nas listagens e dentro de cada musica. */
public record CategoriaResumoDTO(
        Long id,
        String nome
) {
    public static CategoriaResumoDTO from(Categoria categoria) {
        return new CategoriaResumoDTO(categoria.getId(), categoria.getNome());
    }
}
