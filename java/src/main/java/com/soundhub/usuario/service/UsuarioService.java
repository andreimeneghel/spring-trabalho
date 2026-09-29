package com.soundhub.usuario.service;

import com.soundhub.usuario.entity.Usuario;
import com.soundhub.usuario.repository.UsuarioRepository;

import com.soundhub.usuario.dto.AlterarSenhaDTO;
import com.soundhub.usuario.dto.FotoRequestDTO;
import com.soundhub.usuario.dto.UsuarioResponseDTO;
import com.soundhub.usuario.dto.UsuarioUpdateDTO;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.common.util.EmailUtils;
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

    /** Para os outros services buscarem o usuario. */
    @Transactional(readOnly = true)
    public Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario", id));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);

        String email = EmailUtils.normalizar(dto.email());
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

    /** Define ou troca a foto de perfil (somente a propria conta). */
    @Transactional
    public UsuarioResponseDTO atualizarFoto(Long id, FotoRequestDTO dto, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);

        usuario.setFoto(dto.foto());
        log.info("Foto de perfil atualizada: usuario id={}", id);

        return UsuarioResponseDTO.from(usuarioRepository.save(usuario));
    }

    /** Remove a foto, voltando para as iniciais do nome. */
    @Transactional
    public UsuarioResponseDTO removerFoto(Long id, Usuario logado) {
        validarDono(id, logado);
        Usuario usuario = buscarEntidade(id);

        usuario.setFoto(null);
        log.info("Foto de perfil removida: usuario id={}", id);

        return UsuarioResponseDTO.from(usuarioRepository.save(usuario));
    }

    /** Cada usuario so pode alterar/excluir a propria conta. */
    private void validarDono(Long id, Usuario logado) {
        if (!logado.getId().equals(id)) {
            throw new AccessDeniedException("Operacao permitida apenas na propria conta");
        }
    }
}
