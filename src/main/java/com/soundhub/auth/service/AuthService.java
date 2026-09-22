package com.soundhub.auth.service;

import com.soundhub.auth.dto.LoginRequestDTO;
import com.soundhub.auth.dto.RegistroRequestDTO;
import com.soundhub.auth.dto.TokenResponseDTO;
import com.soundhub.usuario.dto.UsuarioResponseDTO;
import com.soundhub.usuario.entity.Usuario;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.util.EmailUtils;
import com.soundhub.usuario.repository.UsuarioRepository;
import com.soundhub.common.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public TokenResponseDTO registrar(RegistroRequestDTO dto) {
        String email = EmailUtils.normalizar(dto.email());

        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("Ja existe um usuario cadastrado com este email");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.nome().trim())
                .email(email)
                .senha(passwordEncoder.encode(dto.senha()))   // senha sempre com hash BCrypt
                .tipo(dto.tipo())
                .build();

        usuario = usuarioRepository.save(usuario);
        log.info("Novo usuario cadastrado: id={} tipo={}", usuario.getId(), usuario.getTipo());

        return gerarResposta(usuario);
    }

    public TokenResponseDTO login(LoginRequestDTO dto) {
        // lanca BadCredentialsException (-> 401) se email ou senha estiverem errados
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(EmailUtils.normalizar(dto.email()), dto.senha()));

        Usuario usuario = (Usuario) auth.getPrincipal();
        log.info("Login realizado: id={}", usuario.getId());

        return gerarResposta(usuario);
    }

    private TokenResponseDTO gerarResposta(Usuario usuario) {
        return TokenResponseDTO.bearer(
                jwtService.gerarToken(usuario),
                jwtService.getExpiracaoMs(),
                UsuarioResponseDTO.from(usuario));
    }

}
