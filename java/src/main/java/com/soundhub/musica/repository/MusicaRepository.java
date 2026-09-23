package com.soundhub.musica.repository;

import com.soundhub.musica.entity.Musica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MusicaRepository extends JpaRepository<Musica, Long> {

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
}
