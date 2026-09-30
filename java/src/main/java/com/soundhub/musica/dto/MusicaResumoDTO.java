package com.soundhub.musica.dto;

import com.soundhub.artista.entity.Album;
import com.soundhub.musica.entity.Musica;

import java.util.Comparator;
import java.util.List;

/** Versao curta, usada nas listagens e na busca. */
public record MusicaResumoDTO(
        Long id,
        String titulo,
        /** Em segundos. */
        Integer duracao,
        Long artistaId,
        String artistaNome,
        Long albumId,
        String albumTitulo,
        List<CategoriaResumoDTO> categorias
) {
    public static MusicaResumoDTO from(Musica musica) {
        Album album = musica.getAlbum();
        return new MusicaResumoDTO(
                musica.getId(),
                musica.getTitulo(),
                musica.getDuracao(),
                musica.getArtista().getId(),
                musica.getArtista().getNomeArtistico(),
                album == null ? null : album.getId(),
                album == null ? null : album.getTitulo(),
                categoriasOrdenadas(musica));
    }

    /** O Set nao tem ordem; ordenar pelo nome deixa a resposta estavel entre chamadas. */
    static List<CategoriaResumoDTO> categoriasOrdenadas(Musica musica) {
        return musica.getCategorias().stream()
                .map(CategoriaResumoDTO::from)
                .sorted(Comparator.comparing(CategoriaResumoDTO::nome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
