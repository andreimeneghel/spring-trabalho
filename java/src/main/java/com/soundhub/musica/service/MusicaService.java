package com.soundhub.musica.service;

import com.soundhub.artista.entity.Album;
import com.soundhub.artista.entity.Artista;
import com.soundhub.artista.repository.AlbumRepository;
import com.soundhub.artista.repository.ArtistaRepository;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.dto.MusicaDetalheDTO;
import com.soundhub.musica.dto.MusicaRequestDTO;
import com.soundhub.musica.dto.MusicaResumoDTO;
import com.soundhub.musica.entity.Categoria;
import com.soundhub.musica.entity.Musica;
import com.soundhub.musica.repository.CategoriaRepository;
import com.soundhub.musica.repository.MusicaRepository;
import com.soundhub.playlist.repository.PlaylistRepository;
import com.soundhub.usuario.entity.Usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Musicas de um artista. Como no album, o artista nunca vem no corpo da
 * requisicao: a musica e sempre vinculada ao perfil de artista do usuario logado.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MusicaService {

    private final MusicaRepository musicaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final PlaylistRepository playlistRepository;

    // ===== Leitura =====

    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> listar() {
        return paraResumo(musicaRepository.findAllCompleto());
    }

    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> buscarPorTitulo(String titulo) {
        return paraResumo(musicaRepository.buscarPorTitulo(titulo.trim()));
    }

    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> listarPorArtista(Long artistaId) {
        if (!artistaRepository.existsById(artistaId)) {
            throw new RecursoNaoEncontradoException("Artista", artistaId);
        }
        return paraResumo(musicaRepository.findByArtistaCompleto(artistaId));
    }

    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> listarPorAlbum(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new RecursoNaoEncontradoException("Album", albumId);
        }
        return paraResumo(musicaRepository.findByAlbumCompleto(albumId));
    }

    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> listarPorCategoria(Long categoriaId) {
        if (!categoriaRepository.existsById(categoriaId)) {
            throw new RecursoNaoEncontradoException("Categoria", categoriaId);
        }
        return paraResumo(musicaRepository.findByCategoriaCompleto(categoriaId));
    }

    /** Musicas do perfil de artista de quem esta logado. */
    @Transactional(readOnly = true)
    public List<MusicaResumoDTO> listarMinhas(Usuario logado) {
        Artista artista = artistaDoUsuario(logado);
        return paraResumo(musicaRepository.findByArtistaCompleto(artista.getId()));
    }

    @Transactional(readOnly = true)
    public MusicaDetalheDTO buscarPorId(Long id) {
        return MusicaDetalheDTO.from(buscarEntidade(id));
    }

    // ===== Escrita =====

    @Transactional
    public MusicaDetalheDTO criar(MusicaRequestDTO dto, Usuario logado) {
        Artista artista = artistaDoUsuario(logado);

        String titulo = dto.titulo().trim();
        if (musicaRepository.existsByArtistaIdAndTituloIgnoreCase(artista.getId(), titulo)) {
            throw new ConflitoException("Voce ja tem uma musica chamada '" + titulo + "'");
        }

        Musica musica = Musica.builder()
                .titulo(titulo)
                .duracao(dto.duracao())
                .artista(artista)
                .album(buscarAlbumDoArtista(dto.albumId(), artista))
                .categorias(buscarCategorias(dto.categoriaIds()))
                .build();

        musica = musicaRepository.save(musica);
        log.info("Musica criada: id={} artista={}", musica.getId(), artista.getId());

        return MusicaDetalheDTO.from(musica);
    }

    @Transactional
    public MusicaDetalheDTO atualizar(Long id, MusicaRequestDTO dto, Usuario logado) {
        Musica musica = buscarEntidade(id);
        validarDono(musica, logado);

        Artista artista = musica.getArtista();
        String titulo = dto.titulo().trim();
        if (musicaRepository.existsByArtistaIdAndTituloIgnoreCaseAndIdNot(
                artista.getId(), titulo, id)) {
            throw new ConflitoException("Este artista ja tem uma musica chamada '" + titulo + "'");
        }

        musica.setTitulo(titulo);
        musica.setDuracao(dto.duracao());
        musica.setAlbum(buscarAlbumDoArtista(dto.albumId(), artista));

        // troca o conteudo do Set em vez do Set: o Hibernate acompanha a colecao original
        musica.getCategorias().clear();
        musica.getCategorias().addAll(buscarCategorias(dto.categoriaIds()));

        log.info("Musica atualizada: id={}", id);

        return MusicaDetalheDTO.from(musicaRepository.save(musica));
    }

    /**
     * Excluir a musica tira ela das playlists de todo mundo e apaga as avaliacoes
     * que ela recebeu. As FKs em playlist_musica e avaliacao sao ON DELETE CASCADE
     * (V3), mas o Hibernate nao conhece essas cascatas do banco: se um desses
     * registros estiver na sessao, o delete quebra. Por isso a limpeza e explicita.
     *
     * A remocao das playlists passa pela entidade, e nao por um UPDATE em massa,
     * para a ordem das musicas ser refeita e nao ficar com buracos na numeracao.
     */
    @Transactional
    public void excluir(Long id, Usuario logado) {
        Musica musica = buscarEntidade(id);
        validarDono(musica, logado);

        for (Long playlistId : musicaRepository.idsDasPlaylistsCom(id)) {
            playlistRepository.findByIdComMusicas(playlistId).ifPresent(playlist -> {
                playlist.removerMusica(id);
                playlistRepository.save(playlist);
            });
        }

        musicaRepository.apagarAvaliacoes(id);   // limpa a sessao junto
        musicaRepository.deleteById(id);
        log.info("Musica excluida: id={}", id);
    }

    // ===== Apoio =====

    private List<MusicaResumoDTO> paraResumo(List<Musica> musicas) {
        return musicas.stream().map(MusicaResumoDTO::from).toList();
    }

    private Musica buscarEntidade(Long id) {
        return musicaRepository.findByIdCompleto(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Musica", id));
    }

    /** Alterar ou excluir uma musica e so para o artista dono dela. */
    private void validarDono(Musica musica, Usuario logado) {
        if (!musica.getArtista().getUsuario().getId().equals(logado.getId())) {
            throw new AccessDeniedException("Esta musica pertence a outro artista");
        }
    }

    /** Toda musica pertence ao perfil de artista de quem esta logado. */
    private Artista artistaDoUsuario(Usuario logado) {
        return artistaRepository.findByUsuarioId(logado.getId())
                .orElseThrow(() -> new RegraNegocioException(
                        "Crie o seu perfil de artista antes de cadastrar uma musica"));
    }

    /**
     * O album e opcional (single), mas quando vem precisa ser do proprio artista:
     * senao daria para pendurar uma musica no album de outra pessoa.
     */
    private Album buscarAlbumDoArtista(Long albumId, Artista artista) {
        if (albumId == null) {
            return null;
        }
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Album", albumId));

        if (!album.getArtista().getId().equals(artista.getId())) {
            throw new RegraNegocioException("O album informado e de outro artista");
        }
        return album;
    }

    /** As categorias precisam existir: a musica nao cria categoria nova. */
    private Set<Categoria> buscarCategorias(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }

        // um null na lista viria de JSON mal montado; ignorar evita quebrar o findAllById
        Set<Long> pedidos = ids.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Categoria> categorias = new HashSet<>(categoriaRepository.findAllById(pedidos));

        if (categorias.size() != pedidos.size()) {
            Set<Long> encontradas = categorias.stream()
                    .map(Categoria::getId)
                    .collect(Collectors.toSet());
            Long faltando = pedidos.stream()
                    .filter(id -> !encontradas.contains(id))
                    .findFirst()
                    .orElseThrow();
            throw new RecursoNaoEncontradoException("Categoria", faltando);
        }
        return categorias;
    }
}
