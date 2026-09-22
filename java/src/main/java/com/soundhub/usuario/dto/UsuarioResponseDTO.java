package com.soundhub.usuario.dto;

import com.soundhub.usuario.entity.TipoUsuario;
import com.soundhub.usuario.entity.Usuario;

/** Nunca devolve a senha. */
public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        TipoUsuario tipo,
        /** Data URI em base64, ou null quando o usuario nao tem foto. */
        String foto
) {
    public static UsuarioResponseDTO from(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                usuario.getFoto());
    }
}
