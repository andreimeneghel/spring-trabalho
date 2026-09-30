package com.soundhub.musica.service;

import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.dto.CategoriaDetalheDTO;
import com.soundhub.musica.dto.CategoriaRequestDTO;
import com.soundhub.musica.dto.CategoriaResumoDTO;
import com.soundhub.musica.entity.Categoria;
import com.soundhub.musica.repository.CategoriaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Categorias musicais (Rock, MPB...). E uma tabela de apoio, compartilhada por
 * todos os artistas: nao tem dono, por isso a permissao e por tipo de usuario
 * (so ARTISTA escreve, conferido no controller) e nao por titularidade.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    // ===== Leitura =====

    @Transactional(readOnly = true)
    public List<CategoriaResumoDTO> listar() {
        return categoriaRepository.findAllByOrderByNomeAsc().stream()
                .map(CategoriaResumoDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaDetalheDTO buscarPorId(Long id) {
        Categoria categoria = buscarEntidade(id);
        return CategoriaDetalheDTO.from(categoria, categoriaRepository.contarMusicas(id));
    }

    // ===== Escrita =====

    @Transactional
    public CategoriaDetalheDTO criar(CategoriaRequestDTO dto) {
        String nome = dto.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new ConflitoException("Ja existe uma categoria chamada '" + nome + "'");
        }

        Categoria categoria = categoriaRepository.save(Categoria.builder().nome(nome).build());
        log.info("Categoria criada: id={} nome={}", categoria.getId(), nome);

        return CategoriaDetalheDTO.from(categoria, 0L);
    }

    @Transactional
    public CategoriaDetalheDTO atualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = buscarEntidade(id);

        String nome = dto.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ConflitoException("Ja existe uma categoria chamada '" + nome + "'");
        }

        categoria.setNome(nome);
        log.info("Categoria atualizada: id={} nome={}", id, nome);

        return CategoriaDetalheDTO.from(
                categoriaRepository.save(categoria), categoriaRepository.contarMusicas(id));
    }

    /**
     * Excluir uma categoria em uso apagaria a marcacao das musicas de outros
     * artistas, entao a exclusao so passa com a categoria vazia.
     */
    @Transactional
    public void excluir(Long id) {
        Categoria categoria = buscarEntidade(id);

        long musicas = categoriaRepository.contarMusicas(id);
        if (musicas > 0) {
            throw new RegraNegocioException(
                    "Esta categoria esta em uso por " + musicas + " musica(s)");
        }

        categoriaRepository.delete(categoria);
        log.info("Categoria excluida: id={}", id);
    }

    // ===== Apoio =====

    private Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}
