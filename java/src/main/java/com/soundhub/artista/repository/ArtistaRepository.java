package com.soundhub.artista.repository;

import com.soundhub.artista.entity.Artista;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArtistaRepository extends JpaRepository<Artista, Long> {

    boolean existsByUsuarioId(Long usuarioId);

    Optional<Artista> findByUsuarioId(Long usuarioId);

    boolean existsByNomeArtisticoIgnoreCase(String nomeArtistico);

    boolean existsByNomeArtisticoIgnoreCaseAndIdNot(String nomeArtistico, Long id);

    /**
     * As consultas abaixo trazem o usuario junto (JOIN FETCH) porque a relacao e LAZY
     * e os DTOs mostram o nome do dono. Sem isso, cada artista da lista geraria
     * um SELECT extra (N+1).
     */
    @Query("""
            SELECT a FROM Artista a
            JOIN FETCH a.usuario
            ORDER BY a.nomeArtistico ASC
            """)
    List<Artista> findAllComUsuario();

    @Query("""
            SELECT a FROM Artista a
            JOIN FETCH a.usuario
            WHERE a.id = :id
            """)
    Optional<Artista> findByIdComUsuario(@Param("id") Long id);

    @Query("""
            SELECT a FROM Artista a
            JOIN FETCH a.usuario
            WHERE a.usuario.id = :usuarioId
            """)
    Optional<Artista> findByUsuarioIdComUsuario(@Param("usuarioId") Long usuarioId);

    @Query("""
            SELECT a FROM Artista a
            JOIN FETCH a.usuario
            WHERE LOWER(a.nomeArtistico) LIKE LOWER(CONCAT('%', :nome, '%'))
            ORDER BY a.nomeArtistico ASC
            """)
    List<Artista> buscarPorNome(@Param("nome") String nome);

    /** Conta as musicas do artista sem precisar de colecao mapeada na entidade. */
    @Query("SELECT COUNT(m) FROM Musica m WHERE m.artista.id = :artistaId")
    long contarMusicas(@Param("artistaId") Long artistaId);
}
