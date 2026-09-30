package com.soundhub.musica.controller;

import com.soundhub.musica.dto.MusicaDetalheDTO;
import com.soundhub.musica.dto.MusicaRequestDTO;
import com.soundhub.musica.dto.MusicaResumoDTO;
import com.soundhub.musica.service.MusicaService;

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
 * Musicas.
 *
 * Consulta: qualquer usuario logado. Escrita: somente ARTISTA, e a musica criada
 * fica sempre no perfil de artista de quem esta logado (a checagem de dono, na
 * alteracao e na exclusao, fica no service).
 */
@Tag(name = "Musicas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/musicas")
@RequiredArgsConstructor
public class MusicaController {

    private final MusicaService musicaService;

    @Operation(summary = "Lista todas as musicas do catalogo")
    @GetMapping
    public ResponseEntity<List<MusicaResumoDTO>> listar() {
        return ResponseEntity.ok(musicaService.listar());
    }

    @Operation(summary = "Busca musicas pelo titulo")
    @GetMapping("/busca")
    public ResponseEntity<List<MusicaResumoDTO>> buscarPorTitulo(@RequestParam String titulo) {
        return ResponseEntity.ok(musicaService.buscarPorTitulo(titulo));
    }

    @Operation(summary = "Lista as musicas do seu perfil de artista",
            description = "400 quando o usuario logado ainda nao criou um perfil de artista")
    @GetMapping("/minhas")
    public ResponseEntity<List<MusicaResumoDTO>> listarMinhas(
            @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(musicaService.listarMinhas(logado));
    }

    @Operation(summary = "Lista as musicas de um artista")
    @GetMapping("/artista/{artistaId}")
    public ResponseEntity<List<MusicaResumoDTO>> listarPorArtista(@PathVariable Long artistaId) {
        return ResponseEntity.ok(musicaService.listarPorArtista(artistaId));
    }

    @Operation(summary = "Lista as musicas de um album")
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<MusicaResumoDTO>> listarPorAlbum(@PathVariable Long albumId) {
        return ResponseEntity.ok(musicaService.listarPorAlbum(albumId));
    }

    @Operation(summary = "Lista as musicas de uma categoria")
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<MusicaResumoDTO>> listarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(musicaService.listarPorCategoria(categoriaId));
    }

    @Operation(summary = "Detalha uma musica com o artista, o album e as categorias")
    @GetMapping("/{id}")
    public ResponseEntity<MusicaDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(musicaService.buscarPorId(id));
    }

    @Operation(summary = "Cria uma musica no seu perfil de artista (somente ARTISTA)",
            description = "400 quando voce ainda nao tem perfil de artista ou o album informado "
                    + "e de outro artista; 404 quando o album ou uma categoria nao existe; "
                    + "409 quando ja existe uma musica sua com esse titulo")
    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<MusicaDetalheDTO> criar(@RequestBody @Valid MusicaRequestDTO dto,
                                                  @AuthenticationPrincipal Usuario logado,
                                                  UriComponentsBuilder uriBuilder) {
        MusicaDetalheDTO criada = musicaService.criar(dto, logado);
        URI uri = uriBuilder.path("/musicas/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @Operation(summary = "Atualiza a musica (somente o artista dono)",
            description = "403 quando a musica e de outro artista; 409 em titulo duplicado")
    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<MusicaDetalheDTO> atualizar(@PathVariable Long id,
                                                      @RequestBody @Valid MusicaRequestDTO dto,
                                                      @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(musicaService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Exclui a musica (somente o artista dono)",
            description = "A musica sai das playlists onde estava e as avaliacoes dela sao apagadas")
    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        musicaService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
