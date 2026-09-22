package com.soundhub.usuario.dto;

import com.soundhub.usuario.entity.Usuario;
import com.soundhub.usuario.entity.TipoUsuario;

/** Nunca devolve a senha. */
public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        TipoUsuario tipo
) {
    public static UsuarioResponseDTO from(Usuario usuario) {
        return new UsuarioResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTipo());
    }
}
