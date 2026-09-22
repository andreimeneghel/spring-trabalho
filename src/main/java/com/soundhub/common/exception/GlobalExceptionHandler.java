package com.soundhub.common.exception;

import com.soundhub.common.exception.dto.ErroResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponseDTO> validacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
                ErroResponseDTO.comCampos(400, "Erro de validacao", "Um ou mais campos estao invalidos",
                        req.getRequestURI(), campos));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponseDTO> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "Corpo da requisicao invalido ou mal formatado", req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponseDTO> tipoParametro(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return erro(HttpStatus.BAD_REQUEST, "Parametro '" + ex.getName() + "' com valor invalido", req);
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponseDTO> regraNegocio(RegraNegocioException ex, HttpServletRequest req) {
        return erro(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponseDTO> credenciais(BadCredentialsException ex, HttpServletRequest req) {
        return erro(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErroResponseDTO> autenticacao(AuthenticationException ex, HttpServletRequest req) {
        return erro(HttpStatus.UNAUTHORIZED, "Falha na autenticacao", req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponseDTO> acessoNegado(AccessDeniedException ex, HttpServletRequest req) {
        return erro(HttpStatus.FORBIDDEN, "Voce nao tem permissao para realizar esta operacao", req);
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponseDTO> naoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest req) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponseDTO> rotaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return erro(HttpStatus.NOT_FOUND, "Rota nao encontrada", req);
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponseDTO> conflito(ConflitoException ex, HttpServletRequest req) {
        return erro(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponseDTO> integridade(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Violacao de integridade em {}: {}", req.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return erro(HttpStatus.CONFLICT, "Operacao viola uma restricao do banco de dados", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponseDTO> generico(Exception ex, HttpServletRequest req) {
        log.error("Erro inesperado em {}", req.getRequestURI(), ex);
        return erro(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor", req);
    }

    private ResponseEntity<ErroResponseDTO> erro(HttpStatus status, String mensagem, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ErroResponseDTO.of(status.value(), status.getReasonPhrase(), mensagem, req.getRequestURI()));
    }
}
