package com.soundhub.musica.repository;

import com.soundhub.musica.entity.Musica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MusicaRepository extends JpaRepository<Musica, Long> {

    boolean existsByArtistaIdAndTituloIgnoreCase(Long artistaId, String titulo);

    boolean existsByArtistaIdAndTituloIgnoreCaseAndIdNot(Long artistaId, String titulo, Long id);

    long countByArtistaId(Long artistaId);

    /**
     * As consultas abaixo trazem artista, album e categorias junto (JOIN FETCH)
     * porque as tres relacoes sao LAZY e aparecem nos DTOs. Sem isso, cada musica
     * da lista geraria SELECTs extras (N+1). O album e as categorias entram com
     * LEFT porque sao opcionais.
     */
    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            ORDER BY m.titulo ASC
            """)
    List<Musica> findAllCompleto();

    /** Traz tambem o usuario dono do artista: e ele que a checagem de permissao compara. */
    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista a
            JOIN FETCH a.usuario
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            WHERE m.id = :id
            """)
    Optional<Musica> findByIdCompleto(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            WHERE m.artista.id = :artistaId
            ORDER BY m.titulo ASC
            """)
    List<Musica> findByArtistaCompleto(@Param("artistaId") Long artistaId);

    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            WHERE m.album.id = :albumId
            ORDER BY m.titulo ASC
            """)
    List<Musica> findByAlbumCompleto(@Param("albumId") Long albumId);

    /**
     * O filtro por categoria usa um EXISTS em vez de restringir o LEFT JOIN FETCH:
     * filtrar direto na relacao buscada devolveria a musica so com a categoria
     * pesquisada, escondendo as outras.
     */
    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            WHERE EXISTS (SELECT 1 FROM Musica m2 JOIN m2.categorias c
                          WHERE m2.id = m.id AND c.id = :categoriaId)
            ORDER BY m.titulo ASC
            """)
    List<Musica> findByCategoriaCompleto(@Param("categoriaId") Long categoriaId);

    @Query("""
            SELECT DISTINCT m FROM Musica m
            JOIN FETCH m.artista
            LEFT JOIN FETCH m.album
            LEFT JOIN FETCH m.categorias
            WHERE LOWER(m.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))
            ORDER BY m.titulo ASC
            """)
    List<Musica> buscarPorTitulo(@Param("titulo") String titulo);

    /**
     * Desvincula as musicas antes de excluir o album.
     *
     * O banco tem ON DELETE SET NULL, mas o Hibernate nao sabe disso: se uma
     * musica do album estiver na sessao, o delete falha com
     * TransientObjectException. O clearAutomatically alinha a sessao depois.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Musica m SET m.album = null WHERE m.album.id = :albumId")
    void desvincularDoAlbum(@Param("albumId") Long albumId);

    /**
     * Playlists que contem a musica. Usado na exclusao: cada playlist precisa
     * remover a musica pela entidade para a ordem ser refeita sem buracos.
     */
    @Query("SELECT DISTINCT pm.playlist.id FROM PlaylistMusica pm WHERE pm.musica.id = :musicaId")
    List<Long> idsDasPlaylistsCom(@Param("musicaId") Long musicaId);

    /**
     * Apaga as avaliacoes da musica antes de exclui-la. O banco tem
     * ON DELETE CASCADE (V3), mas o Hibernate nao sabe disso e uma avaliacao
     * carregada na sessao quebraria o delete.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Avaliacao a WHERE a.musica.id = :musicaId")
    void apagarAvaliacoes(@Param("musicaId") Long musicaId);
}
