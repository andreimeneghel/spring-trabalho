package com.soundhub.service;

import com.soundhub.dto.auth.LoginRequestDTO;
import com.soundhub.dto.auth.RegistroRequestDTO;
import com.soundhub.dto.auth.TokenResponseDTO;
import com.soundhub.dto.usuario.UsuarioResponseDTO;
import com.soundhub.entity.Usuario;
import com.soundhub.exception.ConflitoException;
import com.soundhub.repository.UsuarioRepository;
import com.soundhub.security.JwtService;
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
        String email = normalizarEmail(dto.email());

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
                new UsernamePasswordAuthenticationToken(normalizarEmail(dto.email()), dto.senha()));

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

    static String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
