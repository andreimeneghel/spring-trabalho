package com.soundhub.artista.controller;

import com.soundhub.artista.dto.ArtistaDetalheDTO;
import com.soundhub.artista.dto.ArtistaRequestDTO;
import com.soundhub.artista.dto.ArtistaResumoDTO;
import com.soundhub.artista.service.ArtistaService;

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
 * Perfis de artista.
 *
 * Consulta: qualquer usuario logado. Escrita: somente usuarios do tipo ARTISTA,
 * e ainda assim so no proprio perfil (a checagem de dono fica no service).
 */
@RestController
@RequestMapping("/artistas")
@RequiredArgsConstructor
public class ArtistaController {

    private final ArtistaService artistaService;

    @GetMapping
    public ResponseEntity<List<ArtistaResumoDTO>> listar() {
        return ResponseEntity.ok(artistaService.listar());
    }

    @GetMapping("/busca")
    public ResponseEntity<List<ArtistaResumoDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(artistaService.buscarPorNome(nome));
    }

    @GetMapping("/meu-perfil")
    public ResponseEntity<ArtistaDetalheDTO> meuPerfil(@AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(artistaService.buscarMeuPerfil(logado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistaDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(artistaService.buscarPorId(id));
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<ArtistaDetalheDTO> criar(@RequestBody @Valid ArtistaRequestDTO dto,
                                                   @AuthenticationPrincipal Usuario logado,
                                                   UriComponentsBuilder uriBuilder) {
        ArtistaDetalheDTO criado = artistaService.criar(dto, logado);
        URI uri = uriBuilder.path("/artistas/{id}").buildAndExpand(criado.id()).toUri();
        return ResponseEntity.created(uri).body(criado);
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<ArtistaDetalheDTO> atualizar(@PathVariable Long id,
                                                       @RequestBody @Valid ArtistaRequestDTO dto,
                                                       @AuthenticationPrincipal Usuario logado) {
        return ResponseEntity.ok(artistaService.atualizar(id, dto, logado));
    }

    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario logado) {
        artistaService.excluir(id, logado);
        return ResponseEntity.noContent().build();
    }
}
