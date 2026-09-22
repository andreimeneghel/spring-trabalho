package com.soundhub.artista.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Usado no POST e no PUT de album. O artista nao vem no corpo: o album e sempre
 * criado para o artista do usuario logado.
 */
public record AlbumRequestDTO(

        @NotBlank(message = "O titulo do album e obrigatorio")
        @Size(max = 150, message = "O titulo deve ter no maximo 150 caracteres")
        String titulo,

        /** Opcional. O limite superior (nao pode ser no futuro) e conferido no service. */
        @Min(value = 1900, message = "O ano de lancamento deve ser a partir de 1900")
        Integer anoLancamento
) {
}
