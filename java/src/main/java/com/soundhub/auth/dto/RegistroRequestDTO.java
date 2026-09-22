package com.soundhub.auth.dto;

import com.soundhub.usuario.entity.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistroRequestDTO(

        @NotBlank(message = "O nome e obrigatorio")
        @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "O email e obrigatorio")
        @Email(message = "Email em formato invalido")
        @Size(max = 150, message = "O email deve ter no maximo 150 caracteres")
        String email,

        @NotBlank(message = "A senha e obrigatoria")
        @Size(min = 6, max = 50, message = "A senha deve ter entre 6 e 50 caracteres")
        String senha,

        @NotNull(message = "O tipo e obrigatorio (OUVINTE ou ARTISTA)")
        TipoUsuario tipo
) {
}
