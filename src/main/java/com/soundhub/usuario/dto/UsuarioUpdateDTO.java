package com.soundhub.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(

        @NotBlank(message = "O nome e obrigatorio")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "Email em formato invalido")
        @Size(max = 150, message = "O email deve ter no maximo 150 caracteres")
        String email
) {
}
