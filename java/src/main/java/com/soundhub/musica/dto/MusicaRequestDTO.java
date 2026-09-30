package com.soundhub.musica.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

/**
 * Usado no POST e no PUT de musica. O artista nao vem no corpo: a musica e
 * sempre criada no perfil de artista de quem esta logado.
 */
public record MusicaRequestDTO(

        @NotBlank(message = "O titulo da musica e obrigatorio")
        @Size(max = 150, message = "O titulo deve ter no maximo 150 caracteres")
        String titulo,

        /** Em segundos. O teto de 2h evita duracao digitada errada (ex.: minutos no lugar de segundos). */
        @NotNull(message = "A duracao e obrigatoria")
        @Min(value = 1, message = "A duracao deve ser de pelo menos 1 segundo")
        @Max(value = 7200, message = "A duracao deve ser de no maximo 7200 segundos (2 horas)")
        Integer duracao,

        /** Opcional. Quando vem preenchido, o album precisa ser do mesmo artista. */
        Long albumId,

        /** Opcional. Ids de categorias ja cadastradas em /categorias. */
        @Size(max = 5, message = "Escolha no maximo 5 categorias")
        Set<Long> categoriaIds
) {
}
