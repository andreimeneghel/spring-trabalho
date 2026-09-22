package com.soundhub.playlist.controller;

import com.soundhub.playlist.service.PlaylistService;

import com.soundhub.playlist.dto.AdicionarMusicaDTO;
import com.soundhub.playlist.dto.PlaylistDetalheDTO;
import com.soundhub.playlist.dto.PlaylistRequestDTO;
import com.soundhub.playlist.dto.PlaylistResumoDTO;
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

/** Qualquer usuario logado (OUVINTE ou ARTISTA) pode ter playlists. */
@Tag(name = "Playlists")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @Operation(summary = "Lista as playlists publicas e as suas proprias")
    @GetMapping
    public ResponseEntity<List<PlaylistResumoDTO>> listar(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.listar(logado));
    }

    @Operation(summary = "Lista todas as suas playlists, inclusive as privadas")
    @GetMapping("/minhas")
    public ResponseEntity<List<PlaylistResumoDTO>> listarMinhas(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.listarMinhas(logado));
    }

    @Operation(summary = "Lista as playlists de um usuario (privadas so aparecem para o dono)")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PlaylistResumoDTO>> listarPorUsuario(@PathVariable Long usuarioId,
                                                                    @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.listarPorUsuario(usuarioId, logado));
    }

    @Operation(summary = "Busca playlists publicas pelo nome")
    @GetMapping("/busca")
    public ResponseEntity<List<PlaylistResumoDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(playlistService.buscarPorNome(nome));
    }

    @Operation(summary = "Detalha uma playlist com as suas musicas")
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDetalheDTO> buscarPorId(@PathVariable Long id,
                                                          @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.buscarPorId(id, logado));
    }

    @Operation(summary = "Cria uma playlist")
    @PostMapping
    public ResponseEntity<PlaylistDetalheDTO> criar(@RequestBody @Valid PlaylistRequestDTO dto,
                                                    @AuthenticationPrincipal Usuario logado,
                                                    UriComponentsBuilder uriBuilder) {
        PlaylistDetalheDTO criada = playlistService.criar(dto, logado);
        URI uri = uriBuilder.path("/playlists/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @Operation(summary = "Atualiza os dados da playlist (somente o dono)")
    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDetalheDTO> atualizar(@PathVariable Long id,
                                                        @RequestBody @Valid PlaylistRequestDTO dto,
                                                        @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.atualizar(id, dto, logado));
    }

    @Operation(summary = "Exclui a playlist (somente o dono)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        playlistService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Adiciona uma musica no fim da playlist (somente o dono)")
    @PostMapping("/{id}/musicas")
    public ResponseEntity<PlaylistDetalheDTO> adicionarMusica(@PathVariable Long id,
                                                              @RequestBody @Valid AdicionarMusicaDTO dto,
                                                              @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.adicionarMusica(id, dto, logado));
    }

    @Operation(summary = "Remove uma musica da playlist (somente o dono)")
    @DeleteMapping("/{id}/musicas/{musicaId}")
    public ResponseEntity<PlaylistDetalheDTO> removerMusica(@PathVariable Long id,
                                                            @PathVariable Long musicaId,
                                                            @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(playlistService.removerMusica(id, musicaId, logado));
    }
}
