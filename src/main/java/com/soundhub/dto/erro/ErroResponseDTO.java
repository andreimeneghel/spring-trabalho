package com.soundhub.dto.erro;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/** Formato padrao de erro devolvido por toda a API. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponseDTO(
        LocalDateTime timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho,
        Map<String, String> campos
) {
    public static ErroResponseDTO of(int status, String erro, String mensagem, String caminho) {
        return new ErroResponseDTO(LocalDateTime.now(), status, erro, mensagem, caminho, null);
    }

    public static ErroResponseDTO comCampos(int status, String erro, String mensagem, String caminho,
                                            Map<String, String> campos) {
        return new ErroResponseDTO(LocalDateTime.now(), status, erro, mensagem, caminho, campos);
    }
}
