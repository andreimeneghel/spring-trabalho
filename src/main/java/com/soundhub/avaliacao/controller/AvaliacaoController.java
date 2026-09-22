package com.soundhub.avaliacao.controller;

import com.soundhub.avaliacao.dto.AvaliacaoRequestDTO;
import com.soundhub.avaliacao.dto.AvaliacaoResponseDTO;
import com.soundhub.avaliacao.dto.MediaAvaliacaoDTO;
import com.soundhub.avaliacao.service.AvaliacaoService;
import com.soundhub.usuario.entity.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * As avaliacoes de uma musica ficam em /musicas/{musicaId}/avaliacoes,
 * e a avaliacao ja existente e acessada direto por /avaliacoes/{id}.
 */
@Tag(name = "Avaliacoes")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @Operation(summary = "Lista as avaliacoes de uma musica")
    @GetMapping("/musicas/{musicaId}/avaliacoes")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarPorMusica(@PathVariable Long musicaId) {
        return ResponseEntity.ok(avaliacaoService.listarPorMusica(musicaId));
    }

    @Operation(summary = "Media das notas e total de avaliacoes de uma musica")
    @GetMapping("/musicas/{musicaId}/avaliacoes/media")
    public ResponseEntity<MediaAvaliacaoDTO> media(@PathVariable Long musicaId) {
        return ResponseEntity.ok(avaliacaoService.calcularMedia(musicaId));
    }

    @Operation(summary = "Avalia uma musica com nota de 1 a 5 (uma avaliacao por musica)")
    @PostMapping("/musicas/{musicaId}/avaliacoes")
    public ResponseEntity<AvaliacaoResponseDTO> criar(@PathVariable Long musicaId,
                                                      @RequestBody @Valid AvaliacaoRequestDTO dto,
                                                      @AuthenticationPrincipal Usuario logado,
                                                      UriComponentsBuilder uriBuilder) {
        AvaliacaoResponseDTO criada = avaliacaoService.criar(musicaId, dto, logado);
        URI uri = uriBuilder.path("/avaliacoes/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @Operation(summary = "Lista as avaliacoes que voce ja fez")
    @GetMapping("/avaliacoes/minhas")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarMinhas(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(avaliacaoService.listarMinhas(logado));
    }

    @Operation(summary = "Busca uma avaliacao pelo id")
    @GetMapping("/avaliacoes/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(avaliacaoService.buscarPorId(id));
    }

    @Operation(summary = "Altera a nota ou o comentario (somente o autor)")
    @PutMapping("/avaliacoes/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> atualizar(@PathVariable Long id,
                                                          @RequestBody @Valid AvaliacaoRequestDTO dto,
                                                          @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(avaliacaoService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Exclui a avaliacao (somente o autor)")
    @DeleteMapping("/avaliacoes/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        avaliacaoService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
