package com.soundhub.avaliacao.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Usado para criar uma avaliacao (o id da musica vem na URL). */
public record AvaliacaoRequestDTO(

        @NotNull(message = "A nota e obrigatoria")
        @Min(value = 1, message = "A nota minima e 1")
        @Max(value = 5, message = "A nota maxima e 5")
        Short nota,

        @Size(max = 500, message = "O comentario deve ter no maximo 500 caracteres")
        String comentario
) {
}
