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

// ===== Entidades ainda em construcao (Douglas) =====

export interface Musica {
  id: number;
  titulo: string;
  duracao: number;
  artistaId: number;
  albumId: number | null;
  artista?: string;
}

export interface Categoria {
  id: number;
  nome: string;
}
