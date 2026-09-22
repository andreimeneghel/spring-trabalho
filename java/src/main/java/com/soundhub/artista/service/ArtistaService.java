package com.soundhub.artista.service;

import com.soundhub.artista.dto.AlbumResumoDTO;
import com.soundhub.artista.dto.ArtistaDetalheDTO;
import com.soundhub.artista.dto.ArtistaRequestDTO;
import com.soundhub.artista.dto.ArtistaResumoDTO;
import com.soundhub.artista.entity.Artista;
import com.soundhub.artista.repository.AlbumRepository;
import com.soundhub.artista.repository.ArtistaRepository;

import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Perfil de artista. A relacao com Usuario e 1:1 — cada usuario tem no maximo
 * um perfil, e o perfil sempre pertence ao usuario que o criou.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArtistaService {

    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;

    // ===== Leitura =====

    @Transactional(readOnly = true)
    public List<ArtistaResumoDTO> listar() {
        return artistaRepository.findAllComUsuario().stream()
                .map(ArtistaResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ArtistaResumoDTO> buscarPorNome(String nome) {
        return artistaRepository.buscarPorNome(nome.trim()).stream()
                .map(ArtistaResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ArtistaDetalheDTO buscarPorId(Long id) {
        Artista artista = artistaRepository.findByIdComUsuario(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artista", id));
        return montarDetalhe(artista);
    }

    /** Perfil de artista do proprio usuario logado. */
    @Transactional(readOnly = true)
    public ArtistaDetalheDTO buscarMeuPerfil(Usuario logado) {
        Artista artista = artistaRepository.findByUsuarioIdComUsuario(logado.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Voce ainda nao tem um perfil de artista"));
        return montarDetalhe(artista);
    }

    // ===== Escrita =====

    @Transactional
    public ArtistaDetalheDTO criar(ArtistaRequestDTO dto, Usuario logado) {
        if (artistaRepository.existsByUsuarioId(logado.getId())) {
            throw new ConflitoException("Voce ja tem um perfil de artista");
        }

        String nome = dto.nomeArtistico().trim();
        if (artistaRepository.existsByNomeArtisticoIgnoreCase(nome)) {
            throw new ConflitoException("Ja existe um artista com o nome '" + nome + "'");
        }

        Artista artista = Artista.builder()
                .nomeArtistico(nome)
                .biografia(normalizarBiografia(dto.biografia()))
                .usuario(logado)
                .build();

        artista = artistaRepository.save(artista);
        log.info("Artista criado: id={} usuario={}", artista.getId(), logado.getId());

        return montarDetalhe(artista);
    }

    @Transactional
    public ArtistaDetalheDTO atualizar(Long id, ArtistaRequestDTO dto) {
        Artista artista = buscarEntidade(id);

        String nome = dto.nomeArtistico().trim();
        if (artistaRepository.existsByNomeArtisticoIgnoreCaseAndIdNot(nome, id)) {
            throw new ConflitoException("Ja existe um artista com o nome '" + nome + "'");
        }

        artista.setNomeArtistico(nome);
        artista.setBiografia(normalizarBiografia(dto.biografia()));
        log.info("Artista atualizado: id={}", id);

        return montarDetalhe(artistaRepository.save(artista));
    }

    /**
     * Excluir o artista apagaria em cascata os albuns e as musicas dele (ON DELETE
     * CASCADE na V2). Para nao perder conteudo por engano, so deixa excluir quando
     * nao sobrou nada pendurado.
     */
    @Transactional
    public void excluir(Long id) {
        Artista artista = buscarEntidade(id);

        long albuns = albumRepository.countByArtistaId(id);
        long musicas = artistaRepository.contarMusicas(id);
        if (albuns > 0 || musicas > 0) {
            throw new RegraNegocioException(
                    "Exclua antes os albuns e as musicas deste artista ("
                            + albuns + " album(ns) e " + musicas + " musica(s))");
        }

        artistaRepository.delete(artista);
        log.info("Artista excluido: id={}", id);
    }

    // ===== Apoio =====

    private Artista buscarEntidade(Long id) {
        return artistaRepository.findByIdComUsuario(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artista", id));
    }

    private ArtistaDetalheDTO montarDetalhe(Artista artista) {
        List<AlbumResumoDTO> albuns = albumRepository.findByArtistaComArtista(artista.getId()).stream()
                .map(AlbumResumoDTO::from)
                .toList();
        return ArtistaDetalheDTO.from(artista, artistaRepository.contarMusicas(artista.getId()), albuns);
    }

    /** Biografia em branco vinda do formulario vira null, para nao gravar lixo no banco. */
    private String normalizarBiografia(String biografia) {
        if (biografia == null || biografia.isBlank()) {
            return null;
        }
        return biografia.trim();
    }
}
