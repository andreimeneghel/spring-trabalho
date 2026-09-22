package com.soundhub.avaliacao.service;

import com.soundhub.artista.entity.Artista;
import com.soundhub.avaliacao.entity.Avaliacao;
import com.soundhub.avaliacao.repository.AvaliacaoRepository;

import com.soundhub.avaliacao.dto.AvaliacaoRequestDTO;
import com.soundhub.avaliacao.dto.AvaliacaoResponseDTO;
import com.soundhub.avaliacao.dto.MediaAvaliacaoDTO;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.entity.Musica;
import com.soundhub.musica.repository.MusicaRepository;
import com.soundhub.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final MusicaRepository musicaRepository;

    // ===== Leitura =====

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarPorMusica(Long musicaId) {
        buscarMusica(musicaId);   // 404 se a musica nao existir
        return avaliacaoRepository.findByMusicaIdOrderByCriadaEmDesc(musicaId).stream()
                .map(AvaliacaoResponseDTO::from)
                .toList();
    }

    /** Avaliacoes que o usuario logado ja fez. */
    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarMinhas(Usuario logado) {
        return avaliacaoRepository.findByUsuarioIdOrderByCriadaEmDesc(logado.getId()).stream()
                .map(AvaliacaoResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponseDTO buscarPorId(Long id) {
        return AvaliacaoResponseDTO.from(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public MediaAvaliacaoDTO calcularMedia(Long musicaId) {
        Musica musica = buscarMusica(musicaId);
        return MediaAvaliacaoDTO.of(
                musica.getId(),
                musica.getTitulo(),
                avaliacaoRepository.calcularMediaPorMusica(musicaId),
                avaliacaoRepository.countByMusicaId(musicaId));
    }

    // ===== Escrita =====

    @Transactional
    public AvaliacaoResponseDTO criar(Long musicaId, AvaliacaoRequestDTO dto, Usuario logado) {
        Musica musica = buscarMusica(musicaId);

        if (avaliacaoRepository.existsByUsuarioIdAndMusicaId(logado.getId(), musicaId)) {
            throw new ConflitoException(
                    "Voce ja avaliou esta musica. Use PUT para alterar a sua avaliacao");
        }
        validarNaoEhPropriaMusica(musica, logado);

        Avaliacao avaliacao = Avaliacao.builder()
                .nota(dto.nota())
                .comentario(normalizarComentario(dto.comentario()))
                .usuario(logado)
                .musica(musica)
                .build();

        avaliacao = avaliacaoRepository.save(avaliacao);
        log.info("Avaliacao criada: id={} musica={} nota={}", avaliacao.getId(), musicaId, dto.nota());

        return AvaliacaoResponseDTO.from(avaliacao);
    }

    @Transactional
    public AvaliacaoResponseDTO atualizar(Long id, AvaliacaoRequestDTO dto, Usuario logado) {
        Avaliacao avaliacao = buscarEntidade(id);
        validarAutor(avaliacao, logado);

        avaliacao.setNota(dto.nota());
        avaliacao.setComentario(normalizarComentario(dto.comentario()));
        log.info("Avaliacao atualizada: id={} nota={}", id, dto.nota());

        return AvaliacaoResponseDTO.from(avaliacaoRepository.save(avaliacao));
    }

    @Transactional
    public void excluir(Long id, Usuario logado) {
        Avaliacao avaliacao = buscarEntidade(id);
        validarAutor(avaliacao, logado);
        avaliacaoRepository.delete(avaliacao);
        log.info("Avaliacao excluida: id={}", id);
    }

    // ===== Apoio =====

    private Avaliacao buscarEntidade(Long id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliacao", id));
    }

    private Musica buscarMusica(Long musicaId) {
        return musicaRepository.findById(musicaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Musica", musicaId));
    }

    /** Cada um so mexe na avaliacao que escreveu. */
    private void validarAutor(Avaliacao avaliacao, Usuario logado) {
        if (!avaliacao.getUsuario().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Esta avaliacao foi feita por outro usuario");
        }
    }

    /** Artista nao avalia a propria musica. */
    private void validarNaoEhPropriaMusica(Musica musica, Usuario logado) {
        if (musica.getArtista() != null
                && musica.getArtista().getUsuario() != null
                && musica.getArtista().getUsuario().getId().equals(logado.getId())) {
            throw new RegraNegocioException("Voce nao pode avaliar a sua propria musica");
        }
    }

    private String normalizarComentario(String comentario) {
        if (comentario == null || comentario.isBlank()) {
            return null;
        }
        return comentario.trim();
    }
}
