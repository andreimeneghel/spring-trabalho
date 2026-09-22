package com.soundhub.artista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Usado no POST e no PUT de artista. */
public record ArtistaRequestDTO(

        @NotBlank(message = "O nome artistico e obrigatorio")
        @Size(max = 100, message = "O nome artistico deve ter no maximo 100 caracteres")
        String nomeArtistico,

        @Size(max = 1000, message = "A biografia deve ter no maximo 1000 caracteres")
        String biografia
) {
}
