package com.soundhub.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soundhub.dto.erro.ErroResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Erros que acontecem nos filtros do Spring Security (antes de chegar no controller) nao passam
 * pelo @RestControllerAdvice. Esta classe devolve o mesmo formato padrao de erro para 401 e 403.
 */
@Component
@RequiredArgsConstructor
public class SecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        escrever(response, HttpStatus.UNAUTHORIZED, "Token ausente, invalido ou expirado", request);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        escrever(response, HttpStatus.FORBIDDEN, "Voce nao tem permissao para acessar este recurso", request);
    }

    private void escrever(HttpServletResponse response, HttpStatus status, String mensagem,
                          HttpServletRequest request) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(),
                ErroResponseDTO.of(status.value(), status.getReasonPhrase(), mensagem, request.getRequestURI()));
    }
}
