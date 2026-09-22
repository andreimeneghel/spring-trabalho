package com.soundhub.artista.controller;

import com.soundhub.artista.dto.AlbumDetalheDTO;
import com.soundhub.artista.dto.AlbumRequestDTO;
import com.soundhub.artista.dto.AlbumResumoDTO;
import com.soundhub.artista.service.AlbumService;

import com.soundhub.usuario.entity.Usuario;
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
@RestController
@RequestMapping("/albuns")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping
    public ResponseEntity<List<AlbumResumoDTO>> listar() {
        return ResponseEntity.ok(albumService.listar());
    }

    @GetMapping("/busca")
    public ResponseEntity<List<AlbumResumoDTO>> buscarPorTitulo(@RequestParam String titulo) {
        return ResponseEntity.ok(albumService.buscarPorTitulo(titulo));
    }

    @GetMapping("/artista/{artistaId}")
    public ResponseEntity<List<AlbumResumoDTO>> listarPorArtista(@PathVariable Long artistaId) {
        return ResponseEntity.ok(albumService.listarPorArtista(artistaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.buscarPorId(id));
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<AlbumDetalheDTO> criar(@RequestBody @Valid AlbumRequestDTO dto,
                                                 @AuthenticationPrincipal Usuario logado,
                                                 UriComponentsBuilder uriBuilder) {
        AlbumDetalheDTO criado = albumService.criar(dto, logado);
        URI uri = uriBuilder.path("/albuns/{id}").buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<AlbumDetalheDTO> atualizar(@PathVariable Long id,
                                                     @RequestBody @Valid AlbumRequestDTO dto,
                                                     @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(albumService.atualizar(id, dto, logado));
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        albumService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
