package com.soundhub.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "Email em formato invalido")
        String email,

        @NotBlank(message = "A senha e obrigatoria")
        String senha
) {
}
