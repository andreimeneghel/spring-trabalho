package com.soundhub.artista.controller;

import com.soundhub.artista.dto.AlbumDetalheDTO;
import com.soundhub.artista.dto.AlbumRequestDTO;
import com.soundhub.artista.dto.AlbumResumoDTO;
import com.soundhub.artista.service.AlbumService;

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
 * Albuns.
 *
 * Consulta: qualquer usuario logado. Escrita: somente ARTISTA, e o album criado
 * fica sempre no perfil de artista de quem esta logado.
 */
@Tag(name = "Albuns")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/albuns")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    @Operation(summary = "Lista todos os albuns")
    @GetMapping
    public ResponseEntity<List<AlbumResumoDTO>> listar() {
        return ResponseEntity.ok(albumService.listar());
    }

    @Operation(summary = "Busca albuns pelo titulo")
    @GetMapping("/busca")
    public ResponseEntity<List<AlbumResumoDTO>> buscarPorTitulo(@RequestParam String titulo) {
        return ResponseEntity.ok(albumService.buscarPorTitulo(titulo));
    }

    @Operation(summary = "Lista os albuns de um artista, dos mais recentes para os mais antigos")
    @GetMapping("/artista/{artistaId}")
    public ResponseEntity<List<AlbumResumoDTO>> listarPorArtista(@PathVariable Long artistaId) {
        return ResponseEntity.ok(albumService.listarPorArtista(artistaId));
    }

    @Operation(summary = "Detalha um album com a quantidade de musicas")
    @GetMapping("/{id}")
    public ResponseEntity<AlbumDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.buscarPorId(id));
    }

    @Operation(summary = "Cria um album no seu perfil de artista (somente ARTISTA)",
            description = "400 quando voce ainda nao tem perfil de artista ou o ano e invalido; "
                    + "409 quando ja existe um album seu com esse titulo")
    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<AlbumDetalheDTO> criar(@RequestBody @Valid AlbumRequestDTO dto,
                                                 @AuthenticationPrincipal Usuario logado,
                                                 UriComponentsBuilder uriBuilder) {
        AlbumDetalheDTO criado = albumService.criar(dto, logado);
        URI uri = uriBuilder.path("/albuns/{id}").buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @Operation(summary = "Atualiza o album (somente o artista dono)",
            description = "403 quando o album e de outro artista; 409 em titulo duplicado")
    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<AlbumDetalheDTO> atualizar(@PathVariable Long id,
                                                     @RequestBody @Valid AlbumRequestDTO dto,
                                                     @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(albumService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Exclui o album (somente o artista dono)",
            description = "As musicas do album nao sao apagadas: elas ficam sem album")
    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        albumService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
