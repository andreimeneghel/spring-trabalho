package com.soundhub.musica.repository;

import com.soundhub.musica.entity.Categoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrderByNomeAsc();

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    /** Conta quantas musicas usam a categoria sem precisar do lado inverso mapeado. */
    @Query("SELECT COUNT(m) FROM Musica m JOIN m.categorias c WHERE c.id = :categoriaId")
    long contarMusicas(@Param("categoriaId") Long categoriaId);
}
