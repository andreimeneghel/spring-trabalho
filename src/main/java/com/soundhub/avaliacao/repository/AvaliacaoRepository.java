package com.soundhub.avaliacao.repository;

import com.soundhub.avaliacao.entity.Avaliacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    List<Avaliacao> findByMusicaIdOrderByCriadaEmDesc(Long musicaId);

    List<Avaliacao> findByUsuarioIdOrderByCriadaEmDesc(Long usuarioId);

    Optional<Avaliacao> findByUsuarioIdAndMusicaId(Long usuarioId, Long musicaId);

    boolean existsByUsuarioIdAndMusicaId(Long usuarioId, Long musicaId);

    long countByMusicaId(Long musicaId);

    /** Media das notas da musica. Volta null se a musica ainda nao tem avaliacao. */
    @Query("SELECT AVG(a.nota) FROM Avaliacao a WHERE a.musica.id = :musicaId")
    Double calcularMediaPorMusica(@Param("musicaId") Long musicaId);
}
