package com.soundhub.artista;

import com.soundhub.artista.dto.AlbumDetalheDTO;
import com.soundhub.artista.dto.AlbumRequestDTO;
import com.soundhub.artista.dto.ArtistaDetalheDTO;
import com.soundhub.artista.dto.ArtistaRequestDTO;
import com.soundhub.artista.entity.Album;
import com.soundhub.artista.entity.Artista;
import com.soundhub.artista.service.AlbumService;
import com.soundhub.artista.service.ArtistaService;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.entity.Musica;
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

import java.time.Year;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Cobre Artista e Album: mapeamento JPA contra o schema do Flyway e as regras de
 * negocio dos services (perfil unico, nomes duplicados, permissao de dono,
 * ano de lancamento e exclusao em cascata bloqueada).
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ArtistaAlbumIntegrationTest {

    @Autowired private ArtistaService artistaService;
    @Autowired private AlbumService albumService;
    @Autowired private EntityManager em;

    private Usuario dono;
    private Usuario outroArtista;

    @BeforeEach
    void preparar() {
        dono = novoUsuario("dono@teste.com", TipoUsuario.ARTISTA);
        outroArtista = novoUsuario("outro@teste.com", TipoUsuario.ARTISTA);
    }

    // ===== Artista =====

    @Test
    @DisplayName("cria o perfil de artista do usuario logado e devolve no detalhe")
    void criarPerfil() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("Banda Teste", "uma bio"), dono);

        assertThat(artista.id()).isNotNull();
        assertThat(artista.nomeArtistico()).isEqualTo("Banda Teste");
        assertThat(artista.usuarioId()).isEqualTo(dono.getId());
        assertThat(artista.totalAlbuns()).isZero();
        assertThat(artista.totalMusicas()).isZero();

        assertThat(artistaService.buscarMeuPerfil(dono).id()).isEqualTo(artista.id());
    }

    @Test
    @DisplayName("biografia em branco vira null")
    void biografiaEmBranco() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("Sem Bio", "   "), dono);

        assertThat(artista.biografia()).isNull();
    }

    @Test
    @DisplayName("o mesmo usuario nao pode ter dois perfis de artista")
    void perfilDuplicado() {
        artistaService.criar(new ArtistaRequestDTO("Primeiro", null), dono);

        assertThatThrownBy(() ->
                artistaService.criar(new ArtistaRequestDTO("Segundo", null), dono))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("nome artistico e unico, ignorando maiusculas e minusculas")
    void nomeArtisticoDuplicado() {
        artistaService.criar(new ArtistaRequestDTO("Repetido", null), dono);

        assertThatThrownBy(() ->
                artistaService.criar(new ArtistaRequestDTO("repetido", null), outroArtista))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("usuario sem perfil de artista recebe 404 no meu-perfil")
    void semPerfil() {
        assertThatThrownBy(() -> artistaService.buscarMeuPerfil(dono))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("so o dono altera ou exclui o proprio perfil de artista")
    void somenteDonoAlteraArtista() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("Do Dono", null), dono);

        assertThatThrownBy(() -> artistaService.atualizar(
                artista.id(), new ArtistaRequestDTO("Invadido", null), outroArtista))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> artistaService.excluir(artista.id(), outroArtista))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ===== Album =====

    @Test
    @DisplayName("cria album no perfil do usuario logado e ele aparece no detalhe do artista")
    void criarAlbum() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("Com Album", null), dono);

        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Raizes", 2020), dono);

        assertThat(album.id()).isNotNull();
        assertThat(album.artistaId()).isEqualTo(artista.id());
        assertThat(album.totalMusicas()).isZero();

        ArtistaDetalheDTO depois = artistaService.buscarPorId(artista.id());
        assertThat(depois.totalAlbuns()).isEqualTo(1);
        assertThat(depois.albuns()).extracting("titulo").containsExactly("Raizes");
    }

    @Test
    @DisplayName("nao deixa cadastrar album sem ter perfil de artista")
    void albumSemPerfil() {
        assertThatThrownBy(() -> albumService.criar(new AlbumRequestDTO("Solto", null), dono))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("titulo de album e unico dentro do mesmo artista, mas pode repetir entre artistas")
    void tituloDuplicado() {
        artistaService.criar(new ArtistaRequestDTO("Artista A", null), dono);
        artistaService.criar(new ArtistaRequestDTO("Artista B", null), outroArtista);

        albumService.criar(new AlbumRequestDTO("Ao Vivo", 2021), dono);

        assertThatThrownBy(() -> albumService.criar(new AlbumRequestDTO("ao vivo", 2022), dono))
                .isInstanceOf(ConflitoException.class);

        assertThat(albumService.criar(new AlbumRequestDTO("Ao Vivo", 2022), outroArtista).id())
                .isNotNull();
    }

    @Test
    @DisplayName("ano de lancamento no futuro e recusado")
    void anoNoFuturo() {
        artistaService.criar(new ArtistaRequestDTO("Do Futuro", null), dono);
        int anoQueVem = Year.now().getValue() + 1;

        assertThatThrownBy(() -> albumService.criar(new AlbumRequestDTO("Amanha", anoQueVem), dono))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("so o artista dono altera ou exclui o album")
    void somenteDonoAlteraAlbum() {
        artistaService.criar(new ArtistaRequestDTO("Dono do Album", null), dono);
        artistaService.criar(new ArtistaRequestDTO("Intruso", null), outroArtista);

        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Meu", 2019), dono);

        assertThatThrownBy(() -> albumService.atualizar(
                album.id(), new AlbumRequestDTO("Roubado", 2019), outroArtista))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> albumService.excluir(album.id(), outroArtista))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ===== Exclusao =====

    @Test
    @DisplayName("nao exclui artista que ainda tem album, e exclui depois que ele sai")
    void exclusaoBloqueadaPorAlbum() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("Com Pendencia", null), dono);
        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Unico", 2018), dono);

        assertThatThrownBy(() -> artistaService.excluir(artista.id(), dono))
                .isInstanceOf(RegraNegocioException.class);

        albumService.excluir(album.id(), dono);
        artistaService.excluir(artista.id(), dono);

        assertThatThrownBy(() -> artistaService.buscarPorId(artista.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("excluir album nao apaga as musicas: elas ficam sem album")
    void excluirAlbumMantemMusicas() {
        artistaService.criar(new ArtistaRequestDTO("Com Musica", null), dono);
        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Com Faixas", 2017), dono);

        Album albumRef = em.find(Album.class, album.id());
        Musica musica = Musica.builder()
                .titulo("Faixa Um")
                .duracao(200)
                .artista(albumRef.getArtista())
                .album(albumRef)
                .build();
        em.persist(musica);
        em.flush();

        assertThat(albumService.buscarPorId(album.id()).totalMusicas()).isEqualTo(1);

        albumService.excluir(album.id(), dono);
        em.flush();
        em.clear();

        Musica depois = em.find(Musica.class, musica.getId());
        assertThat(depois).isNotNull();
        assertThat(depois.getAlbum()).isNull();
    }

    @Test
    @DisplayName("artista com musica nao pode ser excluido")
    void exclusaoBloqueadaPorMusica() {
        ArtistaDetalheDTO artista = artistaService.criar(
                new ArtistaRequestDTO("So Com Musica", null), dono);

        Artista artistaRef = em.find(Artista.class, artista.id());
        em.persist(Musica.builder()
                .titulo("Avulsa")
                .duracao(150)
                .artista(artistaRef)
                .build());
        em.flush();

        assertThat(artistaService.buscarPorId(artista.id()).totalMusicas()).isEqualTo(1);

        assertThatThrownBy(() -> artistaService.excluir(artista.id(), dono))
                .isInstanceOf(RegraNegocioException.class);
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
}
