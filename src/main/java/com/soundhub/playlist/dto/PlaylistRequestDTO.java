package com.soundhub.playlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Usado no POST e no PUT de playlist. */
public record PlaylistRequestDTO(

        @NotBlank(message = "O nome da playlist e obrigatorio")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
        String nome,

        @Size(max = 300, message = "A descricao deve ter no maximo 300 caracteres")
        String descricao,

        /** Quando nao informado, a playlist e criada como publica. */
        Boolean publica
) {
    public boolean isPublica() {
        return publica == null || publica;
    }
}
