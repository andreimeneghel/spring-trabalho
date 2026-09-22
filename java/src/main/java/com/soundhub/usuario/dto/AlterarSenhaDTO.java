package com.soundhub.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(

        @NotBlank(message = "A senha atual e obrigatoria")
        String senhaAtual,

        @NotBlank(message = "A nova senha e obrigatoria")
        @Size(min = 6, max = 50, message = "A nova senha deve ter entre 6 e 50 caracteres")
        String novaSenha
) {
}
