package com.soundhub.artista.service;

import com.soundhub.artista.dto.AlbumDetalheDTO;
import com.soundhub.artista.dto.AlbumRequestDTO;
import com.soundhub.artista.dto.AlbumResumoDTO;
import com.soundhub.artista.entity.Album;
import com.soundhub.musica.repository.MusicaRepository;
import com.soundhub.artista.entity.Artista;
import com.soundhub.artista.repository.AlbumRepository;
import com.soundhub.artista.repository.ArtistaRepository;

import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

/**
 * Albuns de um artista. O album nunca recebe o artista pelo corpo da requisicao:
 * ele e sempre vinculado ao perfil de artista do usuario logado.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumService {

    /** Nao existe album lancado antes do disco de vinil virar comum. */
    private static final int ANO_MINIMO = 1900;

    private final AlbumRepository albumRepository;
    private final MusicaRepository musicaRepository;
    private final ArtistaRepository artistaRepository;

    // ===== Leitura =====

    @Transactional(readOnly = true)
    public List<AlbumResumoDTO> listar() {
        return albumRepository.findAllComArtista().stream()
                .map(AlbumResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlbumResumoDTO> listarPorArtista(Long artistaId) {
        if (!artistaRepository.existsById(artistaId)) {
            throw new RecursoNaoEncontradoException("Artista", artistaId);
        }
        return albumRepository.findByArtistaComArtista(artistaId).stream()
                .map(AlbumResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlbumResumoDTO> buscarPorTitulo(String titulo) {
        return albumRepository.buscarPorTitulo(titulo.trim()).stream()
                .map(AlbumResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlbumDetalheDTO buscarPorId(Long id) {
        Album album = buscarEntidade(id);
        return AlbumDetalheDTO.from(album, albumRepository.contarMusicas(id));
    }

    // ===== Escrita =====

    @Transactional
    public AlbumDetalheDTO criar(AlbumRequestDTO dto, Usuario logado) {
        Artista artista = artistaDoUsuario(logado);
        validarAno(dto.anoLancamento());

        String titulo = dto.titulo().trim();
        if (albumRepository.existsByArtistaIdAndTituloIgnoreCase(artista.getId(), titulo)) {
            throw new ConflitoException("Voce ja tem um album chamado '" + titulo + "'");
        }

        Album album = Album.builder()
                .titulo(titulo)
                .anoLancamento(dto.anoLancamento())
                .capa(normalizarImagem(dto.capa()))
                .artista(artista)
                .build();

        album = albumRepository.save(album);
        log.info("Album criado: id={} artista={}", album.getId(), artista.getId());

        return AlbumDetalheDTO.from(album, 0L);
    }

    @Transactional
    public AlbumDetalheDTO atualizar(Long id, AlbumRequestDTO dto, Usuario logado) {
        Album album = buscarEntidade(id);
        validarDono(album, logado);
        validarAno(dto.anoLancamento());

        String titulo = dto.titulo().trim();
        Long artistaId = album.getArtista().getId();
        if (albumRepository.existsByArtistaIdAndTituloIgnoreCaseAndIdNot(artistaId, titulo, id)) {
            throw new ConflitoException("Este artista ja tem um album chamado '" + titulo + "'");
        }

        album.setTitulo(titulo);
        album.setAnoLancamento(dto.anoLancamento());
        album.setCapa(normalizarImagem(dto.capa()));
        log.info("Album atualizado: id={}", id);

        return AlbumDetalheDTO.from(albumRepository.save(album), albumRepository.contarMusicas(id));
    }

    /**
     * As musicas do album nao sao apagadas: a FK em musica e ON DELETE SET NULL,
     * entao elas continuam existindo, apenas sem album (V2).
     */
    @Transactional
    public void excluir(Long id, Usuario logado) {
        Album album = buscarEntidade(id);
        validarDono(album, logado);

        // as musicas ficam sem album, nao sao apagadas junto
        musicaRepository.desvincularDoAlbum(id);

        albumRepository.delete(album);
        log.info("Album excluido: id={}", id);
    }

    // ===== Apoio =====

    private Album buscarEntidade(Long id) {
        return albumRepository.findByIdComArtista(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Album", id));
    }

    /** Alterar ou excluir um album e so para o artista dono dele. */
    private void validarDono(Album album, Usuario logado) {
        if (!album.getArtista().getUsuario().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Este album pertence a outro artista");
        }
    }

    /** Todo album pertence ao perfil de artista de quem esta logado. */
    private Artista artistaDoUsuario(Usuario logado) {
        return artistaRepository.findByUsuarioId(logado.getId())
                .orElseThrow(() -> new RegraNegocioException(
                        "Crie o seu perfil de artista antes de cadastrar um album"));
    }

    /** O @Min do DTO cobre o piso; o teto depende do ano de hoje, entao fica aqui. */
    /** String vazia vinda do formulario vira null, para nao gravar lixo no banco. */
    private String normalizarImagem(String imagem) {
        if (imagem == null || imagem.isBlank()) {
            return null;
        }
        return imagem;
    }

    private void validarAno(Integer ano) {
        if (ano == null) {
            return;
        }
        int anoAtual = Year.now().getValue();
        if (ano < ANO_MINIMO || ano > anoAtual) {
            throw new RegraNegocioException(
                    "O ano de lancamento deve estar entre " + ANO_MINIMO + " e " + anoAtual);
        }
    }
}
