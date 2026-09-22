package com.soundhub.playlist;

import com.soundhub.artista.entity.Artista;
import com.soundhub.avaliacao.dto.AvaliacaoRequestDTO;
import com.soundhub.avaliacao.dto.MediaAvaliacaoDTO;
import com.soundhub.avaliacao.service.AvaliacaoService;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.musica.entity.Musica;
import com.soundhub.playlist.dto.AdicionarMusicaDTO;
import com.soundhub.playlist.dto.PlaylistDetalheDTO;
import com.soundhub.playlist.dto.PlaylistRequestDTO;
import com.soundhub.playlist.service.PlaylistService;
import com.soundhub.usuario.entity.TipoUsuario;
import com.soundhub.usuario.entity.Usuario;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Cobre a parte de Playlist e Avaliacao: mapeamento JPA contra o schema do Flyway
 * e as regras de negocio dos services.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PlaylistAvaliacaoIntegrationTest {

    @Autowired private PlaylistService playlistService;
    @Autowired private AvaliacaoService avaliacaoService;
    @Autowired private EntityManager em;

    private Usuario ouvinte;
    private Usuario outro;
    private Musica musica1;
    private Musica musica2;

    @BeforeEach
    void preparar() {
        ouvinte = novoUsuario("ouvinte@teste.com", TipoUsuario.OUVINTE);
        outro = novoUsuario("outro@teste.com", TipoUsuario.OUVINTE);

        Usuario dono = novoUsuario("artista@teste.com", TipoUsuario.ARTISTA);
        Artista artista = Artista.builder()
                .nomeArtistico("Banda Teste")
                .usuario(dono)
                .build();
        em.persist(artista);

        musica1 = novaMusica("Musica Um", 210, artista);
        musica2 = novaMusica("Musica Dois", 180, artista);
        em.flush();
    }

    // ===== Playlist =====

    @Test
    @DisplayName("cria playlist e adiciona musicas na ordem, somando a duracao")
    void criarEAdicionarMusicas() {
        PlaylistDetalheDTO playlist = playlistService.criar(
                new PlaylistRequestDTO("Favoritas", "as melhores", true), ouvinte);

        assertThat(playlist.id()).isNotNull();
        assertThat(playlist.totalMusicas()).isZero();

        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(musica1.getId()), ouvinte);
        PlaylistDetalheDTO comDuas = playlistService.adicionarMusica(
                playlist.id(), new AdicionarMusicaDTO(musica2.getId()), ouvinte);

        assertThat(comDuas.totalMusicas()).isEqualTo(2);
        assertThat(comDuas.duracaoTotal()).isEqualTo(390);
        assertThat(comDuas.musicas()).extracting("ordem").containsExactly(0, 1);
        assertThat(comDuas.musicas()).extracting("titulo")
                .containsExactly("Musica Um", "Musica Dois");
    }

    @Test
    @DisplayName("nao deixa adicionar a mesma musica duas vezes")
    void musicaDuplicada() {
        PlaylistDetalheDTO playlist = playlistService.criar(
                new PlaylistRequestDTO("Rock", null, true), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(musica1.getId()), ouvinte);

        assertThatThrownBy(() -> playlistService.adicionarMusica(
                playlist.id(), new AdicionarMusicaDTO(musica1.getId()), ouvinte))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("ao remover uma musica do meio, a ordem e refeita sem buracos")
    void removerMusicaReordena() {
        PlaylistDetalheDTO playlist = playlistService.criar(
                new PlaylistRequestDTO("Mix", null, true), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(musica1.getId()), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(musica2.getId()), ouvinte);

        PlaylistDetalheDTO depois = playlistService.removerMusica(
                playlist.id(), musica1.getId(), ouvinte);

        assertThat(depois.totalMusicas()).isEqualTo(1);
        assertThat(depois.musicas()).extracting("ordem").containsExactly(0);
        assertThat(depois.musicas()).extracting("titulo").containsExactly("Musica Dois");
    }

    @Test
    @DisplayName("nao deixa o mesmo usuario ter duas playlists com o mesmo nome")
    void nomeDuplicado() {
        playlistService.criar(new PlaylistRequestDTO("Repetida", null, true), ouvinte);

        assertThatThrownBy(() ->
                playlistService.criar(new PlaylistRequestDTO("repetida", null, true), ouvinte))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("playlist privada nao aparece para outro usuario")
    void playlistPrivada() {
        PlaylistDetalheDTO privada = playlistService.criar(
                new PlaylistRequestDTO("Secreta", null, false), ouvinte);

        assertThatThrownBy(() -> playlistService.buscarPorId(privada.id(), outro))
                .isInstanceOf(AccessDeniedException.class);

        assertThat(playlistService.listar(outro))
                .extracting("nome").doesNotContain("Secreta");
    }

    @Test
    @DisplayName("so o dono altera a playlist")
    void somenteDonoAltera() {
        PlaylistDetalheDTO playlist = playlistService.criar(
                new PlaylistRequestDTO("Minha", null, true), ouvinte);

        assertThatThrownBy(() -> playlistService.excluir(playlist.id(), outro))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> playlistService.adicionarMusica(
                playlist.id(), new AdicionarMusicaDTO(musica1.getId()), outro))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ===== Avaliacao =====

    @Test
    @DisplayName("calcula a media das notas de uma musica")
    void mediaDasNotas() {
        avaliacaoService.criar(musica1.getId(), new AvaliacaoRequestDTO((short) 5, "top"), ouvinte);
        avaliacaoService.criar(musica1.getId(), new AvaliacaoRequestDTO((short) 4, null), outro);

        MediaAvaliacaoDTO media = avaliacaoService.calcularMedia(musica1.getId());

        assertThat(media.media()).isEqualTo(4.5);
        assertThat(media.totalAvaliacoes()).isEqualTo(2);
    }

    @Test
    @DisplayName("musica sem avaliacao tem media zero")
    void mediaSemAvaliacao() {
        MediaAvaliacaoDTO media = avaliacaoService.calcularMedia(musica2.getId());

        assertThat(media.media()).isZero();
        assertThat(media.totalAvaliacoes()).isZero();
    }

    @Test
    @DisplayName("o mesmo usuario nao avalia a mesma musica duas vezes")
    void avaliacaoDuplicada() {
        avaliacaoService.criar(musica1.getId(), new AvaliacaoRequestDTO((short) 3, null), ouvinte);

        assertThatThrownBy(() -> avaliacaoService.criar(
                musica1.getId(), new AvaliacaoRequestDTO((short) 5, null), ouvinte))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("so o autor altera ou exclui a propria avaliacao")
    void somenteAutorAltera() {
        var avaliacao = avaliacaoService.criar(
                musica1.getId(), new AvaliacaoRequestDTO((short) 3, "ok"), ouvinte);

        assertThatThrownBy(() -> avaliacaoService.atualizar(
                avaliacao.id(), new AvaliacaoRequestDTO((short) 1, "nao"), outro))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> avaliacaoService.excluir(avaliacao.id(), outro))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("atualizar a avaliacao muda a nota e recalcula a media")
    void atualizarAvaliacao() {
        var avaliacao = avaliacaoService.criar(
                musica1.getId(), new AvaliacaoRequestDTO((short) 2, "mais ou menos"), ouvinte);

        avaliacaoService.atualizar(avaliacao.id(), new AvaliacaoRequestDTO((short) 5, "melhorou"), ouvinte);

        List<?> avaliacoes = avaliacaoService.listarPorMusica(musica1.getId());
        assertThat(avaliacoes).hasSize(1);
        assertThat(avaliacaoService.calcularMedia(musica1.getId()).media()).isEqualTo(5.0);
    }

    // ===== Apoio =====

    private Usuario novoUsuario(String email, TipoUsuario tipo) {
        Usuario usuario = Usuario.builder()
                .nome(email.substring(0, email.indexOf('@')))
                .email(email)
                .senha("$2a$10$hashdementira")
                .tipo(tipo)
                .build();
        em.persist(usuario);
        return usuario;
    }

    private Musica novaMusica(String titulo, int duracao, Artista artista) {
        Musica musica = Musica.builder()
                .titulo(titulo)
                .duracao(duracao)
                .artista(artista)
                .build();
        em.persist(musica);
        return musica;
    }
}
