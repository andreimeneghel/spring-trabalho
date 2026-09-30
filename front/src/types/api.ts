/**
 * Espelho dos DTOs do backend, em java/src/main/java/com/soundhub.
 * Ao mudar um DTO no Spring, atualize aqui tambem.
 */

export type TipoUsuario = "OUVINTE" | "ARTISTA";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  /** Data URI em base64 (PNG ou JPG), ou null quando nao tem foto. */
  foto: string | null;
}

export interface TokenResponse {
  token: string;
  tipo: "Bearer";
  expiraEmSegundos: number;
  usuario: Usuario;
}

export interface PlaylistResumo {
  id: number;
  nome: string;
  descricao: string | null;
  publica: boolean;
  /** Capa em data URI base64 (PNG ou JPG), ou null. */
  capa: string | null;
  criadaEm: string;
  donoId: number;
  donoNome: string;
  totalMusicas: number;
}

export interface MusicaDaPlaylist {
  musicaId: number;
  titulo: string;
  duracao: number;
  artista: string | null;
  ordem: number;
}

export interface PlaylistDetalhe {
  id: number;
  nome: string;
  descricao: string | null;
  publica: boolean;
  /** Capa em data URI base64 (PNG ou JPG), ou null. */
  capa: string | null;
  criadaEm: string;
  donoId: number;
  donoNome: string;
  totalMusicas: number;
  /** Soma da duracao das musicas, em segundos. */
  duracaoTotal: number;
  musicas: MusicaDaPlaylist[];
}

export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string | null;
  criadaEm: string;
  atualizadaEm: string | null;
  usuarioId: number;
  usuarioNome: string;
  musicaId: number;
  musicaTitulo: string;
}

export interface MediaAvaliacao {
  musicaId: number;
  musicaTitulo: string;
  media: number;
  totalAvaliacoes: number;
}

/** Formato unico de erro da API (ErroResponseDTO). */
export interface ErroResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  /** Presente apenas em erro de validacao (400). */
  campos?: Record<string, string>;
}

// ===== Artista e Album (Gustavo) =====

export interface ArtistaResumo {
  id: number;
  nomeArtistico: string;
  biografia: string | null;
  /** Foto em data URI base64 (PNG ou JPG), ou null. */
  foto: string | null;
  usuarioId: number;
  usuarioNome: string;
}

export interface ArtistaDetalhe extends ArtistaResumo {
  totalAlbuns: number;
  totalMusicas: number;
  albuns: AlbumResumo[];
}

export interface AlbumResumo {
  id: number;
  titulo: string;
  anoLancamento: number | null;
  /** Capa em data URI base64 (PNG ou JPG), ou null. */
  capa: string | null;
  artistaId: number;
  artistaNome: string;
}

export interface AlbumDetalhe extends AlbumResumo {
  totalMusicas: number;
}

// ===== Musica e Categoria (Douglas) =====

export interface Categoria {
  id: number;
  nome: string;
}

/** GET /categorias/{id} e as respostas de POST/PUT: traz o uso da categoria. */
export interface CategoriaDetalhe extends Categoria {
  totalMusicas: number;
}

export interface MusicaResumo {
  id: number;
  titulo: string;
  /** Em segundos. */
  duracao: number;
  artistaId: number;
  artistaNome: string;
  /** null quando a musica e um single, sem album. */
  albumId: number | null;
  albumTitulo: string | null;
  /** Ordenadas pelo nome. Vazio quando a musica nao tem categoria. */
  categorias: Categoria[];
}

/** GET /musicas/{id}: acrescenta as imagens e o ano do album. */
export interface MusicaDetalhe extends MusicaResumo {
  /** Data URI base64 (PNG ou JPG), ou null. */
  artistaFoto: string | null;
  /** Data URI base64 (PNG ou JPG), ou null. */
  albumCapa: string | null;
  albumAnoLancamento: number | null;
}
