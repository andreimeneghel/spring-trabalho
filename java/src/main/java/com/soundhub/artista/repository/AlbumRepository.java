package com.soundhub.artista.repository;

import com.soundhub.artista.entity.Album;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    long countByArtistaId(Long artistaId);

    boolean existsByArtistaIdAndTituloIgnoreCase(Long artistaId, String titulo);

    boolean existsByArtistaIdAndTituloIgnoreCaseAndIdNot(Long artistaId, String titulo, Long id);

    /** Mesmo motivo do ArtistaRepository: o artista e LAZY e aparece nos DTOs. */
    @Query("""
            SELECT a FROM Album a
            JOIN FETCH a.artista
            ORDER BY a.titulo ASC
            """)
    List<Album> findAllComArtista();

    /**
     * Traz tambem o usuario dono do artista: e ele que a validacao de permissao
     * compara com quem esta logado.
     */
    @Query("""
            SELECT a FROM Album a
            JOIN FETCH a.artista ar
            JOIN FETCH ar.usuario
            WHERE a.id = :id
            """)
    Optional<Album> findByIdComArtista(@Param("id") Long id);

    @Query("""
            SELECT a FROM Album a
            JOIN FETCH a.artista
            WHERE a.artista.id = :artistaId
            ORDER BY a.anoLancamento DESC, a.titulo ASC
            """)
    List<Album> findByArtistaComArtista(@Param("artistaId") Long artistaId);

    @Query("""
            SELECT a FROM Album a
            JOIN FETCH a.artista
            WHERE LOWER(a.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))
            ORDER BY a.titulo ASC
            """)
    List<Album> buscarPorTitulo(@Param("titulo") String titulo);

    @Query("SELECT COUNT(m) FROM Musica m WHERE m.album.id = :albumId")
    long contarMusicas(@Param("albumId") Long albumId);
}
