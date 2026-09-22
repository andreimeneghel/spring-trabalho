package com.soundhub.controller;

import com.soundhub.dto.auth.LoginRequestDTO;
import com.soundhub.dto.auth.RegistroRequestDTO;
import com.soundhub.dto.auth.TokenResponseDTO;
import com.soundhub.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticacao", description = "Cadastro e login (rotas publicas)")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Cadastra um novo usuario (OUVINTE ou ARTISTA) e ja devolve o token")
    @PostMapping("/registrar")
    public ResponseEntity<TokenResponseDTO> registrar(@RequestBody @Valid RegistroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(dto));
    }

    @Operation(summary = "Faz login com email e senha e devolve o token JWT")
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}
