package com.soundhub.musica;

import com.soundhub.artista.dto.AlbumDetalheDTO;
import com.soundhub.artista.dto.AlbumRequestDTO;
import com.soundhub.artista.dto.ArtistaDetalheDTO;
import com.soundhub.artista.dto.ArtistaRequestDTO;
import com.soundhub.artista.service.AlbumService;
import com.soundhub.artista.service.ArtistaService;
import com.soundhub.avaliacao.dto.AvaliacaoRequestDTO;
import com.soundhub.avaliacao.service.AvaliacaoService;
import com.soundhub.common.exception.ConflitoException;
import com.soundhub.common.exception.RecursoNaoEncontradoException;
import com.soundhub.common.exception.RegraNegocioException;
import com.soundhub.musica.dto.CategoriaDetalheDTO;
import com.soundhub.musica.dto.CategoriaRequestDTO;
import com.soundhub.musica.dto.CategoriaResumoDTO;
import com.soundhub.musica.dto.MusicaDetalheDTO;
import com.soundhub.musica.dto.MusicaRequestDTO;
import com.soundhub.musica.dto.MusicaResumoDTO;
import com.soundhub.musica.service.CategoriaService;
import com.soundhub.musica.service.MusicaService;
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
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Cobre Musica e Categoria: mapeamento JPA contra o schema do Flyway e as regras
 * de negocio dos services (titulo unico por artista, album do proprio artista,
 * categorias existentes, permissao de dono, exclusao limpando playlists e
 * avaliacoes, e categoria em uso barrando a exclusao).
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MusicaCategoriaIntegrationTest {

    @Autowired private MusicaService musicaService;
    @Autowired private CategoriaService categoriaService;
    @Autowired private ArtistaService artistaService;
    @Autowired private AlbumService albumService;
    @Autowired private PlaylistService playlistService;
    @Autowired private AvaliacaoService avaliacaoService;
    @Autowired private EntityManager em;

    private Usuario dono;
    private Usuario outroArtista;
    private Usuario ouvinte;

    @BeforeEach
    void preparar() {
        dono = novoUsuario("dono@teste.com", TipoUsuario.ARTISTA);
        outroArtista = novoUsuario("outro@teste.com", TipoUsuario.ARTISTA);
        ouvinte = novoUsuario("ouvinte@teste.com", TipoUsuario.OUVINTE);
    }

    // ===== Musica =====

    @Test
    @DisplayName("cria musica no perfil do artista logado, com album e categorias")
    void criarMusica() {
        ArtistaDetalheDTO artista = perfil(dono, "Banda Teste");
        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Raizes", 2020, null), dono);
        Long rock = idDaCategoria("Rock");
        Long mpb = idDaCategoria("MPB");

        MusicaDetalheDTO musica = musicaService.criar(
                new MusicaRequestDTO("Amanhecer", 214, album.id(), Set.of(rock, mpb)), dono);

        assertThat(musica.id()).isNotNull();
        assertThat(musica.artistaId()).isEqualTo(artista.id());
        assertThat(musica.albumTitulo()).isEqualTo("Raizes");
        assertThat(musica.duracao()).isEqualTo(214);
        assertThat(musica.categorias()).extracting(CategoriaResumoDTO::nome)
                .containsExactly("MPB", "Rock");   // ordenadas pelo nome

        // as contagens de Artista e Album passam a enxergar a musica
        assertThat(artistaService.buscarPorId(artista.id()).totalMusicas()).isEqualTo(1);
        assertThat(albumService.buscarPorId(album.id()).totalMusicas()).isEqualTo(1);
    }

    @Test
    @DisplayName("musica sem album e sem categoria e aceita (single solto)")
    void criarMusicaSemAlbum() {
        perfil(dono, "Sem Album");

        MusicaDetalheDTO musica = musicaService.criar(
                new MusicaRequestDTO("  Avulsa  ", 180, null, null), dono);

        assertThat(musica.titulo()).isEqualTo("Avulsa");   // titulo vem com trim
        assertThat(musica.albumId()).isNull();
        assertThat(musica.categorias()).isEmpty();
    }

    @Test
    @DisplayName("nao deixa cadastrar musica sem ter perfil de artista")
    void musicaSemPerfil() {
        assertThatThrownBy(() ->
                musicaService.criar(new MusicaRequestDTO("Orfa", 100, null, null), dono))
                .isInstanceOf(RegraNegocioException.class);

        assertThatThrownBy(() -> musicaService.listarMinhas(dono))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("titulo de musica e unico dentro do mesmo artista, mas pode repetir entre artistas")
    void tituloDuplicado() {
        perfil(dono, "Artista A");
        perfil(outroArtista, "Artista B");

        musicaService.criar(new MusicaRequestDTO("Vento Sul", 200, null, null), dono);

        assertThatThrownBy(() ->
                musicaService.criar(new MusicaRequestDTO("vento sul", 210, null, null), dono))
                .isInstanceOf(ConflitoException.class);

        assertThat(musicaService.criar(
                new MusicaRequestDTO("Vento Sul", 210, null, null), outroArtista).id())
                .isNotNull();
    }

    @Test
    @DisplayName("nao aceita pendurar a musica no album de outro artista")
    void albumDeOutroArtista() {
        perfil(dono, "Dono do Album");
        perfil(outroArtista, "Invasor");
        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Meu", 2019, null), dono);

        assertThatThrownBy(() -> musicaService.criar(
                new MusicaRequestDTO("Invadida", 190, album.id(), null), outroArtista))
                .isInstanceOf(RegraNegocioException.class);

        assertThatThrownBy(() -> musicaService.criar(
                new MusicaRequestDTO("Fantasma", 190, 9999L, null), dono))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("categoria inexistente barra o cadastro da musica")
    void categoriaInexistente() {
        perfil(dono, "Com Categoria");

        assertThatThrownBy(() -> musicaService.criar(
                new MusicaRequestDTO("Sem Genero", 150, null, Set.of(9999L)), dono))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("atualizar troca titulo, duracao, album e categorias")
    void atualizarMusica() {
        perfil(dono, "Vai Mudar");
        AlbumDetalheDTO album = albumService.criar(new AlbumRequestDTO("Primeiro", 2021, null), dono);
        Long rock = idDaCategoria("Rock");
        Long jazz = idDaCategoria("Jazz");

        MusicaDetalheDTO musica = musicaService.criar(
                new MusicaRequestDTO("Rascunho", 100, album.id(), Set.of(rock)), dono);

        MusicaDetalheDTO depois = musicaService.atualizar(
                musica.id(), new MusicaRequestDTO("Versao Final", 240, null, Set.of(jazz)), dono);

        assertThat(depois.titulo()).isEqualTo("Versao Final");
        assertThat(depois.duracao()).isEqualTo(240);
        assertThat(depois.albumId()).isNull();   // saiu do album
        assertThat(depois.categorias()).extracting(CategoriaResumoDTO::nome).containsExactly("Jazz");

        assertThat(albumService.buscarPorId(album.id()).totalMusicas()).isZero();
    }

    @Test
    @DisplayName("so o artista dono altera ou exclui a musica")
    void somenteDonoAlteraMusica() {
        perfil(dono, "Dono da Musica");
        perfil(outroArtista, "Intruso");

        MusicaDetalheDTO musica = musicaService.criar(
                new MusicaRequestDTO("Minha", 170, null, null), dono);

        assertThatThrownBy(() -> musicaService.atualizar(
                musica.id(), new MusicaRequestDTO("Roubada", 170, null, null), outroArtista))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> musicaService.excluir(musica.id(), outroArtista))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("busca por titulo e parcial e ignora maiusculas e minusculas")
    void buscarPorTitulo() {
        perfil(dono, "Buscavel");
        musicaService.criar(new MusicaRequestDTO("Madrugada Fria", 196, null, null), dono);
        musicaService.criar(new MusicaRequestDTO("Serra Acima", 168, null, null), dono);

        assertThat(musicaService.buscarPorTitulo("madru"))
                .extracting(MusicaResumoDTO::titulo)
                .containsExactly("Madrugada Fria");

        assertThat(musicaService.buscarPorTitulo("xyz")).isEmpty();
    }

    @Test
    @DisplayName("filtrar por categoria devolve a musica com todas as categorias dela")
    void listarPorCategoria() {
        perfil(dono, "Multigenero");
        Long rock = idDaCategoria("Rock");
        Long metal = idDaCategoria("Metal");
        Long jazz = idDaCategoria("Jazz");

        musicaService.criar(new MusicaRequestDTO("Peso", 200, null, Set.of(rock, metal)), dono);
        musicaService.criar(new MusicaRequestDTO("Suave", 200, null, Set.of(jazz)), dono);

        List<MusicaResumoDTO> doRock = musicaService.listarPorCategoria(rock);

        assertThat(doRock).extracting(MusicaResumoDTO::titulo).containsExactly("Peso");
        // o filtro nao pode esconder as outras categorias da musica encontrada
        assertThat(doRock.getFirst().categorias()).extracting(CategoriaResumoDTO::nome)
                .containsExactly("Metal", "Rock");
    }

    @Test
    @DisplayName("listagens por artista, album e categoria dao 404 com id inexistente")
    void listagensComIdInexistente() {
        assertThatThrownBy(() -> musicaService.listarPorArtista(9999L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> musicaService.listarPorAlbum(9999L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> musicaService.listarPorCategoria(9999L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        assertThatThrownBy(() -> musicaService.buscarPorId(9999L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("minhas musicas traz so as do artista logado")
    void listarMinhas() {
        perfil(dono, "Eu");
        perfil(outroArtista, "Ele");
        musicaService.criar(new MusicaRequestDTO("Minha Faixa", 150, null, null), dono);
        musicaService.criar(new MusicaRequestDTO("Faixa Dele", 150, null, null), outroArtista);

        assertThat(musicaService.listarMinhas(dono))
                .extracting(MusicaResumoDTO::titulo)
                .containsExactly("Minha Faixa");
    }

    @Test
    @DisplayName("excluir musica tira ela das playlists, refazendo a ordem, e apaga as avaliacoes")
    void excluirMusicaLimpaPlaylistEAvaliacoes() {
        perfil(dono, "Vai Apagar");
        MusicaDetalheDTO primeira = musicaService.criar(
                new MusicaRequestDTO("Primeira", 100, null, null), dono);
        MusicaDetalheDTO doMeio = musicaService.criar(
                new MusicaRequestDTO("Do Meio", 110, null, null), dono);
        MusicaDetalheDTO ultima = musicaService.criar(
                new MusicaRequestDTO("Ultima", 120, null, null), dono);

        PlaylistDetalheDTO playlist = playlistService.criar(
                new PlaylistRequestDTO("Favoritas", null, true, null), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(primeira.id()), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(doMeio.id()), ouvinte);
        playlistService.adicionarMusica(playlist.id(), new AdicionarMusicaDTO(ultima.id()), ouvinte);

        avaliacaoService.criar(doMeio.id(), new AvaliacaoRequestDTO((short) 5, "otima"), ouvinte);
        assertThat(avaliacaoService.calcularMedia(doMeio.id()).totalAvaliacoes()).isEqualTo(1);

        musicaService.excluir(doMeio.id(), dono);

        assertThatThrownBy(() -> musicaService.buscarPorId(doMeio.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        PlaylistDetalheDTO depois = playlistService.buscarPorId(playlist.id(), ouvinte);
        assertThat(depois.totalMusicas()).isEqualTo(2);
        assertThat(depois.musicas()).extracting("titulo").containsExactly("Primeira", "Ultima");
        assertThat(depois.musicas()).extracting("ordem").containsExactly(0, 1);   // sem buracos
        assertThat(depois.duracaoTotal()).isEqualTo(220);

        assertThat(avaliacaoService.listarMinhas(ouvinte)).isEmpty();
    }

    // ===== Categoria =====

    @Test
    @DisplayName("a migration V7 deixa as categorias iniciais prontas para escolher")
    void categoriasIniciais() {
        List<CategoriaResumoDTO> categorias = categoriaService.listar();

        // a ordem exata depende do collation do banco, entao o teste confere so o conteudo
        assertThat(categorias).hasSizeGreaterThanOrEqualTo(12)
                .extracting(CategoriaResumoDTO::nome)
                .contains("Rock", "MPB", "Jazz", "Samba");
    }

    @Test
    @DisplayName("nome de categoria e unico, ignorando maiusculas e minusculas")
    void categoriaDuplicada() {
        categoriaService.criar(new CategoriaRequestDTO("Bossa Nova"));

        assertThatThrownBy(() -> categoriaService.criar(new CategoriaRequestDTO("bossa nova")))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("renomear categoria mantem as musicas ligadas a ela")
    void renomearCategoria() {
        perfil(dono, "Do Genero");
        CategoriaDetalheDTO criada = categoriaService.criar(new CategoriaRequestDTO("Indie"));
        musicaService.criar(new MusicaRequestDTO("Garagem", 190, null, Set.of(criada.id())), dono);

        CategoriaDetalheDTO renomeada = categoriaService.atualizar(
                criada.id(), new CategoriaRequestDTO("Indie Rock"));

        assertThat(renomeada.nome()).isEqualTo("Indie Rock");
        assertThat(renomeada.totalMusicas()).isEqualTo(1);
        assertThat(musicaService.listarPorCategoria(criada.id()))
                .extracting(MusicaResumoDTO::titulo)
                .containsExactly("Garagem");
    }

    @Test
    @DisplayName("categoria em uso nao pode ser excluida; sem musica, pode")
    void exclusaoBloqueadaPorMusica() {
        perfil(dono, "Ultimo Uso");
        CategoriaDetalheDTO categoria = categoriaService.criar(new CategoriaRequestDTO("Experimental"));
        MusicaDetalheDTO musica = musicaService.criar(
                new MusicaRequestDTO("Ruido", 130, null, Set.of(categoria.id())), dono);

        assertThat(categoriaService.buscarPorId(categoria.id()).totalMusicas()).isEqualTo(1);
        assertThatThrownBy(() -> categoriaService.excluir(categoria.id()))
                .isInstanceOf(RegraNegocioException.class);

        // tirando a categoria da musica, a exclusao passa
        musicaService.atualizar(musica.id(), new MusicaRequestDTO("Ruido", 130, null, null), dono);
        categoriaService.excluir(categoria.id());

        assertThatThrownBy(() -> categoriaService.buscarPorId(categoria.id()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    // ===== Apoio =====

    private ArtistaDetalheDTO perfil(Usuario usuario, String nomeArtistico) {
        return artistaService.criar(new ArtistaRequestDTO(nomeArtistico, null, null), usuario);
    }

    /** Ids das categorias vindas da migration V7, buscados pelo nome. */
    private Long idDaCategoria(String nome) {
        return categoriaService.listar().stream()
                .filter(c -> c.nome().equalsIgnoreCase(nome))
                .findFirst()
                .orElseThrow()
                .id();
    }

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
