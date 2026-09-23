package com.soundhub.artista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Usado no POST e no PUT de artista. */
public record ArtistaRequestDTO(

        @NotBlank(message = "O nome artistico e obrigatorio")
        @Size(max = 100, message = "O nome artistico deve ter no maximo 100 caracteres")
        String nomeArtistico,

        @Size(max = 1000, message = "A biografia deve ter no maximo 1000 caracteres")
        String biografia,

        /**
         * Data URI em base64. Opcional — null ou vazio grava sem imagem. So
         * aceita PNG e JPEG: o Pattern barra outros tipos (inclusive SVG, que
         * poderia carregar script).
         */
        @Size(max = 2_800_000, message = "A imagem deve ter no maximo 2MB")
        @Pattern(
                regexp = "^$|^data:image/(png|jpeg|jpg);base64,[A-Za-z0-9+/]+={0,2}$",
                message = "Formato invalido. Envie uma imagem PNG ou JPG")
        String foto
) {
}
