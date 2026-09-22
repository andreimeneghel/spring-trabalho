package com.soundhub.artista.controller;

import com.soundhub.artista.dto.ArtistaDetalheDTO;
import com.soundhub.artista.dto.ArtistaRequestDTO;
import com.soundhub.artista.dto.ArtistaResumoDTO;
import com.soundhub.artista.service.ArtistaService;

import com.soundhub.usuario.entity.Usuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Perfis de artista.
 *
 * Consulta: qualquer usuario logado. Escrita: somente usuarios do tipo ARTISTA,
 * e ainda assim so no proprio perfil (a checagem de dono fica no service).
 */
@Tag(name = "Artistas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/artistas")
@RequiredArgsConstructor
public class ArtistaController {

    private final ArtistaService artistaService;

    @Operation(summary = "Lista todos os artistas")
    @GetMapping
    public ResponseEntity<List<ArtistaResumoDTO>> listar() {
        return ResponseEntity.ok(artistaService.listar());
    }

    @Operation(summary = "Busca artistas pelo nome artistico")
    @GetMapping("/busca")
    public ResponseEntity<List<ArtistaResumoDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(artistaService.buscarPorNome(nome));
    }

    @Operation(summary = "Devolve o seu perfil de artista",
            description = "404 quando o usuario logado ainda nao criou um perfil de artista")
    @GetMapping("/meu-perfil")
    public ResponseEntity<ArtistaDetalheDTO> meuPerfil(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(artistaService.buscarMeuPerfil(logado));
    }

    @Operation(summary = "Detalha um artista com as contagens e os albuns dele")
    @GetMapping("/{id}")
    public ResponseEntity<ArtistaDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(artistaService.buscarPorId(id));
    }

    @Operation(summary = "Cria o seu perfil de artista (somente ARTISTA)",
            description = "409 quando voce ja tem um perfil ou o nome artistico ja existe")
    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<ArtistaDetalheDTO> criar(@RequestBody @Valid ArtistaRequestDTO dto,
                                                   @AuthenticationPrincipal Usuario logado,
                                                   UriComponentsBuilder uriBuilder) {
        ArtistaDetalheDTO criado = artistaService.criar(dto, logado);
        URI uri = uriBuilder.path("/artistas/{id}").buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @Operation(summary = "Atualiza o perfil de artista (somente o dono)",
            description = "403 quando o perfil e de outro usuario; 409 quando o nome ja existe")
    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<ArtistaDetalheDTO> atualizar(@PathVariable Long id,
                                                       @RequestBody @Valid ArtistaRequestDTO dto,
                                                       @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(artistaService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Exclui o perfil de artista (somente o dono)",
            description = "400 enquanto o artista ainda tiver album ou musica cadastrada")
    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        artistaService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
