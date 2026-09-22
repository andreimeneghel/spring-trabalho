package com.soundhub.playlist.dto;

import jakarta.validation.constraints.NotNull;

public record AdicionarMusicaDTO(

        @NotNull(message = "O id da musica e obrigatorio")
        Long musicaId
) {
}
