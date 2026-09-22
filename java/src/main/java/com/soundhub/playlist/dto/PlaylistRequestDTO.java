package com.soundhub.playlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Usado no POST e no PUT de playlist. */
public record PlaylistRequestDTO(

        @NotBlank(message = "O nome da playlist e obrigatorio")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
        String nome,

        @Size(max = 300, message = "A descricao deve ter no maximo 300 caracteres")
        String descricao,

        /** Quando nao informado, a playlist e criada como publica. */
        Boolean publica,

        /**
         * Capa como data URI em base64. Opcional — quando null ou vazio, a playlist
         * fica sem capa. So aceita PNG e JPEG: o Pattern barra qualquer outro tipo
         * (inclusive SVG, que poderia carregar script).
         */
        @Size(max = 2_800_000, message = "A capa deve ter no maximo 2MB")
        @Pattern(
                regexp = "^$|^data:image/(png|jpeg|jpg);base64,[A-Za-z0-9+/]+={0,2}$",
                message = "Formato de capa invalido. Envie uma imagem PNG ou JPG")
        String capa
) {
    public boolean isPublica() {
        return publica == null || publica;
    }
}
