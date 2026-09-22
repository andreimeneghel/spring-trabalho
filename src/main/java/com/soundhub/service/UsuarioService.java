package com.soundhub.service;

import com.soundhub.dto.usuario.AlterarSenhaDTO;
import com.soundhub.dto.usuario.UsuarioResponseDTO;
import com.soundhub.dto.usuario.UsuarioUpdateDTO;
import com.soundhub.entity.Usuario;
import com.soundhub.exception.ConflitoException;
import com.soundhub.exception.RecursoNaoEncontradoException;
import com.soundhub.exception.RegraNegocioException;
import com.soundhub.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return UsuarioResponseDTO.from(buscarEntidade(id));
    }

    /** Para os outros services (Playlist, Avaliacao, Artista...) buscarem o usuario. */
    @Transactional(readOnly = true)
    public Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario", id));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);

        String email = AuthService.normalizarEmail(dto.email());
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ConflitoException("Ja existe um usuario cadastrado com este email");
        }

        usuario.setNome(dto.nome().trim());
        usuario.setEmail(email);
        log.info("Usuario atualizado: id={}", id);

        return UsuarioResponseDTO.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void alterarSenha(Long id, AlterarSenhaDTO dto, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new RegraNegocioException("Senha atual incorreta");
        }
        if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenha())) {
            throw new RegraNegocioException("A nova senha deve ser diferente da atual");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuarioRepository.save(usuario);
        log.info("Senha alterada: usuario id={}", id);
    }

    @Transactional
    public void excluir(Long id, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);
        usuarioRepository.delete(usuario);
        log.info("Usuario excluido: id={}", id);
    }

    /** Cada usuario so pode alterar/excluir a propria conta. */
    private void validarDono(Long id, Usuario logado) {
        if (!logado.getId().equals(id)) {
            throw new AccessDeniedException("Operacao permitida apenas na propria conta");
        }
    }
}
