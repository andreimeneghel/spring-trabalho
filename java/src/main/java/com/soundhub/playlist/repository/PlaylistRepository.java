package com.soundhub.playlist.repository;

import com.soundhub.playlist.entity.Playlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUsuarioIdOrderByNomeAsc(Long usuarioId);

    /** Playlists publicas de todo mundo + todas as do proprio usuario logado. */
    @Query("""
            SELECT p FROM Playlist p
            WHERE p.publica = true OR p.usuario.id = :usuarioId
            ORDER BY p.nome ASC
            """)
    List<Playlist> findVisiveisPara(@Param("usuarioId") Long usuarioId);

    List<Playlist> findByNomeContainingIgnoreCaseAndPublicaTrueOrderByNomeAsc(String nome);

    boolean existsByUsuarioIdAndNomeIgnoreCase(Long usuarioId, String nome);

    boolean existsByUsuarioIdAndNomeIgnoreCaseAndIdNot(Long usuarioId, String nome, Long id);

    /** Carrega a playlist junto com as musicas, evitando N+1 na hora de montar o detalhe. */
    @Query("""
            SELECT DISTINCT p FROM Playlist p
            LEFT JOIN FETCH p.musicas pm
            LEFT JOIN FETCH pm.musica m
            LEFT JOIN FETCH m.artista
            WHERE p.id = :id
            """)
    Optional<Playlist> findByIdComMusicas(@Param("id") Long id);
}
