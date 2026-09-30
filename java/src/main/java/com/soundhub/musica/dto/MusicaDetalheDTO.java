package com.soundhub.musica.dto;

import com.soundhub.artista.entity.Album;
import com.soundhub.musica.entity.Musica;

import java.util.List;

/** Versao completa: acrescenta as imagens e o ano do album ao que ja vem no resumo. */
public record MusicaDetalheDTO(
        Long id,
        String titulo,
        /** Em segundos. */
        Integer duracao,
        Long artistaId,
        String artistaNome,
        /** Data URI em base64, ou null. */
        String artistaFoto,
        Long albumId,
        String albumTitulo,
        /** Data URI em base64, ou null. */
        String albumCapa,
        Integer albumAnoLancamento,
        List<CategoriaResumoDTO> categorias
) {
    public static MusicaDetalheDTO from(Musica musica) {
        Album album = musica.getAlbum();
        return new MusicaDetalheDTO(
                musica.getId(),
                musica.getTitulo(),
                musica.getDuracao(),
                musica.getArtista().getId(),
                musica.getArtista().getNomeArtistico(),
                musica.getArtista().getFoto(),
                album == null ? null : album.getId(),
                album == null ? null : album.getTitulo(),
                album == null ? null : album.getCapa(),
                album == null ? null : album.getAnoLancamento(),
                MusicaResumoDTO.categoriasOrdenadas(musica));
    }
}
