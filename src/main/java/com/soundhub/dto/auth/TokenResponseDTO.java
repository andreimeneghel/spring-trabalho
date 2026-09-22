package com.soundhub.dto.auth;

import com.soundhub.dto.usuario.UsuarioResponseDTO;

public record TokenResponseDTO(
        String token,
        String tipo,
        long expiraEmSegundos,
        UsuarioResponseDTO usuario
) {
    public static TokenResponseDTO bearer(String token, long expiraEmMs, UsuarioResponseDTO usuario) {
        return new TokenResponseDTO(token, "Bearer", expiraEmMs / 1000, usuario);
    }
}
