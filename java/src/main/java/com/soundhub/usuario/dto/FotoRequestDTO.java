package com.soundhub.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Foto de perfil enviada como data URI em base64.
 *
 * So aceita PNG e JPEG — o Pattern barra qualquer outro tipo (inclusive SVG,
 * que poderia carregar script) antes mesmo de chegar no service.
 */
public record FotoRequestDTO(

        @NotBlank(message = "A foto e obrigatoria")
        @Size(max = 2_800_000, message = "A imagem deve ter no maximo 2MB")
        @Pattern(
                regexp = "^data:image/(png|jpeg|jpg);base64,[A-Za-z0-9+/]+={0,2}$",
                message = "Formato invalido. Envie uma imagem PNG ou JPG")
        String foto
) {
}
