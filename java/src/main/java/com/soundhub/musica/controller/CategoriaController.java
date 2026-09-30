package com.soundhub.musica.controller;

import com.soundhub.musica.dto.CategoriaDetalheDTO;
import com.soundhub.musica.dto.CategoriaRequestDTO;
import com.soundhub.musica.dto.CategoriaResumoDTO;
import com.soundhub.musica.service.CategoriaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Categorias musicais.
 *
 * Consulta: qualquer usuario logado. Escrita: somente ARTISTA — a tabela e
 * compartilhada (nao tem dono), entao quem publica musica tambem mantem a lista.
 */
@Tag(name = "Categorias")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @Operation(summary = "Lista as categorias em ordem alfabetica")
    @GetMapping
    public ResponseEntity<List<CategoriaResumoDTO>> listar() {
        return ResponseEntity.ok(categoriaService.listar());
    }

    @Operation(summary = "Detalha uma categoria com a quantidade de musicas")
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaDetalheDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    @Operation(summary = "Cria uma categoria (somente ARTISTA)",
            description = "409 quando ja existe uma categoria com esse nome")
    @PreAuthorize("hasRole('ARTISTA')")
    @PostMapping
    public ResponseEntity<CategoriaDetalheDTO> criar(@RequestBody @Valid CategoriaRequestDTO dto,
                                                     UriComponentsBuilder uriBuilder) {
        CategoriaDetalheDTO criada = categoriaService.criar(dto);
        URI uri = uriBuilder.path("/categorias/{id}").buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @Operation(summary = "Renomeia uma categoria (somente ARTISTA)",
            description = "409 quando o nome novo ja existe")
    @PreAuthorize("hasRole('ARTISTA')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDetalheDTO> atualizar(@PathVariable Long id,
                                                         @RequestBody @Valid CategoriaRequestDTO dto) {
        return ResponseEntity.ok(categoriaService.atualizar(id, dto));
    }

    @Operation(summary = "Exclui uma categoria (somente ARTISTA)",
            description = "400 enquanto alguma musica ainda estiver usando a categoria")
    @PreAuthorize("hasRole('ARTISTA')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        categoriaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
