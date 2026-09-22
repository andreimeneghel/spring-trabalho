package com.soundhub.usuario.controller;

import com.soundhub.usuario.entity.Usuario;
import com.soundhub.usuario.service.UsuarioService;

import com.soundhub.usuario.dto.AlterarSenhaDTO;
import com.soundhub.usuario.dto.UsuarioResponseDTO;
import com.soundhub.usuario.dto.UsuarioUpdateDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** O "create" do CRUD de usuario e o POST /auth/registrar. */
@Tag(name = "Usuarios")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Lista todos os usuarios")
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listar());
    }

    @Operation(summary = "Dados do usuario logado (dono do token)")
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(UsuarioResponseDTO.from(logado));
    }

    @Operation(summary = "Busca um usuario pelo id")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @Operation(summary = "Atualiza nome e email (somente a propria conta)")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id,
                                                        @RequestBody @Valid UsuarioUpdateDTO dto,
                                                        @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Altera a senha (somente a propria conta)")
    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable Long id,
                                             @RequestBody @Valid AlterarSenhaDTO dto,
                                             @AuthenticationPrincipal Usuario logado) {
        usuarioService.alterarSenha(id, dto, logado);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Exclui a conta (somente a propria conta)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        usuarioService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
