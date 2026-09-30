package com.soundhub.musica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Usado no POST e no PUT de categoria. */
public record CategoriaRequestDTO(

        @NotBlank(message = "O nome da categoria e obrigatorio")
        @Size(max = 50, message = "O nome deve ter no maximo 50 caracteres")
        String nome
) {
}
