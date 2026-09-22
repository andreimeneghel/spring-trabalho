package com.soundhub.playlist.service;

import com.soundhub.playlist.entity.Playlist;
import com.soundhub.playlist.repository.PlaylistRepository;

import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.entity.Musica;
import com.soundhub.musica.repository.MusicaRepository;
import com.soundhub.playlist.dto.AdicionarMusicaDTO;
import com.soundhub.playlist.dto.PlaylistDetalheDTO;
import com.soundhub.playlist.dto.PlaylistRequestDTO;
import com.soundhub.playlist.dto.PlaylistResumoDTO;
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
public class PlaylistService {

    /** Limite para uma playlist nao crescer sem controle. */
    private static final int MAX_MUSICAS_POR_PLAYLIST = 500;

    private final PlaylistRepository playlistRepository;
    private final MusicaRepository musicaRepository;

    // ===== Leitura =====

    /** Playlists publicas de todos + as privadas do proprio usuario logado. */
    @Transactional(readOnly = true)
    public List<PlaylistResumoDTO> listar(Usuario logado) {
        return playlistRepository.findVisiveisPara(logado.getId()).stream()
                .map(PlaylistResumoDTO::from)
                .toList();
    }

    /** Todas as playlists do usuario logado, publicas e privadas. */
    @Transactional(readOnly = true)
    public List<PlaylistResumoDTO> listarMinhas(Usuario logado) {
        return playlistRepository.findByUsuarioIdOrderByNomeAsc(logado.getId()).stream()
                .map(PlaylistResumoDTO::from)
                .toList();
    }

    /** Playlists de um usuario qualquer: so as publicas, a menos que seja o proprio dono. */
    @Transactional(readOnly = true)
    public List<PlaylistResumoDTO> listarPorUsuario(Long usuarioId, Usuario logado) {
        boolean ehDono = logado.getId().equals(usuarioId);
        return playlistRepository.findByUsuarioIdOrderByNomeAsc(usuarioId).stream()
                .filter(p -> ehDono || p.isPublica())
                .map(PlaylistResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlaylistResumoDTO> buscarPorNome(String nome) {
        return playlistRepository
                .findByNomeContainingIgnoreCaseAndPublicaTrueOrderByNomeAsc(nome.trim()).stream()
                .map(PlaylistResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlaylistDetalheDTO buscarPorId(Long id, Usuario logado) {
        Playlist playlist = playlistRepository.findByIdComMusicas(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Playlist", id));
        validarPodeVer(playlist, logado);
        return PlaylistDetalheDTO.from(playlist);
    }

    // ===== Escrita =====

    @Transactional
    public PlaylistDetalheDTO criar(PlaylistRequestDTO dto, Usuario logado) {
        String nome = dto.nome().trim();

        if (playlistRepository.existsByUsuarioIdAndNomeIgnoreCase(logado.getId(), nome)) {
            throw new ConflitoException("Voce ja tem uma playlist com o nome '" + nome + "'");
        }

        Playlist playlist = Playlist.builder()
                .nome(nome)
                .descricao(normalizarDescricao(dto.descricao()))
                .publica(dto.isPublica())
                .capa(normalizarCapa(dto.capa()))
                .usuario(logado)
                .build();

        playlist = playlistRepository.save(playlist);
        log.info("Playlist criada: id={} usuario={}", playlist.getId(), logado.getId());

        return PlaylistDetalheDTO.from(playlist);
    }

    @Transactional
    public PlaylistDetalheDTO atualizar(Long id, PlaylistRequestDTO dto, Usuario logado) {
        Playlist playlist = buscarEntidade(id);
        validarDono(playlist, logado);

        String nome = dto.nome().trim();
        if (playlistRepository.existsByUsuarioIdAndNomeIgnoreCaseAndIdNot(logado.getId(), nome, id)) {
            throw new ConflitoException("Voce ja tem uma playlist com o nome '" + nome + "'");
        }

        playlist.setNome(nome);
        playlist.setDescricao(normalizarDescricao(dto.descricao()));
        playlist.setPublica(dto.isPublica());
        playlist.setCapa(normalizarCapa(dto.capa()));
        log.info("Playlist atualizada: id={}", id);

        return PlaylistDetalheDTO.from(playlistRepository.save(playlist));
    }

    @Transactional
    public void excluir(Long id, Usuario logado) {
        Playlist playlist = buscarEntidade(id);
        validarDono(playlist, logado);
        playlistRepository.delete(playlist);
        log.info("Playlist excluida: id={}", id);
    }

    // ===== Musicas da playlist =====

    @Transactional
    public PlaylistDetalheDTO adicionarMusica(Long id, AdicionarMusicaDTO dto, Usuario logado) {
        Playlist playlist = playlistRepository.findByIdComMusicas(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Playlist", id));
        validarDono(playlist, logado);

        Musica musica = musicaRepository.findById(dto.musicaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Musica", dto.musicaId()));

        if (playlist.contemMusica(musica.getId())) {
            throw new ConflitoException("Esta musica ja esta na playlist");
        }
        if (playlist.getMusicas().size() >= MAX_MUSICAS_POR_PLAYLIST) {
            throw new RegraNegocioException(
                    "A playlist atingiu o limite de " + MAX_MUSICAS_POR_PLAYLIST + " musicas");
        }

        playlist.adicionarMusica(musica);
        log.info("Musica {} adicionada na playlist {}", musica.getId(), id);

        return PlaylistDetalheDTO.from(playlistRepository.save(playlist));
    }

    @Transactional
    public PlaylistDetalheDTO removerMusica(Long id, Long musicaId, Usuario logado) {
        Playlist playlist = playlistRepository.findByIdComMusicas(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Playlist", id));
        validarDono(playlist, logado);

        if (!playlist.removerMusica(musicaId)) {
            throw new RecursoNaoEncontradoException("Esta musica nao esta na playlist");
        }
        log.info("Musica {} removida da playlist {}", musicaId, id);

        return PlaylistDetalheDTO.from(playlistRepository.save(playlist));
    }

    // ===== Apoio =====

    private Playlist buscarEntidade(Long id) {
        return playlistRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Playlist", id));
    }

    /** Alterar playlist so o dono. */
    private void validarDono(Playlist playlist, Usuario logado) {
        if (!playlist.getUsuario().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Esta playlist pertence a outro usuario");
        }
    }

    /** Playlist privada so o dono enxerga. */
    private void validarPodeVer(Playlist playlist, Usuario logado) {
        if (!playlist.isPublica() && !playlist.getUsuario().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Esta playlist e privada");
        }
    }

    /** String vazia vinda do formulario vira null, para nao gravar lixo no banco. */
    private String normalizarCapa(String capa) {
        if (capa == null || capa.isBlank()) {
            return null;
        }
        return capa;
    }

    private String normalizarDescricao(String descricao) {
        if (descricao == null || descricao.isBlank()) {
            return null;
        }
        return descricao.trim();
    }
}
