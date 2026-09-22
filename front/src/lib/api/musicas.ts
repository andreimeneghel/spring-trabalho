import "server-only";

import { apiFetch } from "./client";
import type { Categoria, Musica } from "@/types/api";

/**
 * Musica e Categoria ainda estao sendo construidas pelo Douglas.
 * Enquanto os endpoints nao existem, MOCK_MUSICAS=true no .env.local faz o front
 * trabalhar com dados de exemplo — nenhum componente precisa mudar depois.
 *
 * Observacao: POST /playlists/{id}/musicas JA funciona no backend; ele so precisa
 * de um musicaId que exista no banco.
 */
const USAR_MOCK = process.env.MOCK_MUSICAS === "true";

const MUSICAS_EXEMPLO: Musica[] = [
  { id: 1, titulo: "Amanhecer", duracao: 214, artistaId: 1, albumId: 1, artista: "Marina Dias" },
  { id: 2, titulo: "Rua de Baixo", duracao: 187, artistaId: 1, albumId: 1, artista: "Marina Dias" },
  { id: 3, titulo: "Vento Sul", duracao: 243, artistaId: 2, albumId: 2, artista: "Coletivo Norte" },
  { id: 4, titulo: "Madrugada", duracao: 196, artistaId: 2, albumId: 2, artista: "Coletivo Norte" },
  { id: 5, titulo: "Serra Acima", duracao: 168, artistaId: 3, albumId: null, artista: "Trio Catarina" },
  { id: 6, titulo: "Quase La", duracao: 225, artistaId: 3, albumId: null, artista: "Trio Catarina" },
];

const CATEGORIAS_EXEMPLO: Categoria[] = [
  { id: 1, nome: "MPB" },
  { id: 2, nome: "Rock" },
  { id: 3, nome: "Eletronica" },
];

export async function listarMusicas(): Promise<Musica[]> {
  if (USAR_MOCK) return MUSICAS_EXEMPLO;
  return apiFetch<Musica[]>("/musicas", { cache: "no-store" });
}

export async function buscarMusica(id: number): Promise<Musica | null> {
  if (USAR_MOCK) return MUSICAS_EXEMPLO.find((m) => m.id === id) ?? null;
  return apiFetch<Musica>(`/musicas/${id}`, { cache: "no-store" });
}

export async function listarCategorias(): Promise<Categoria[]> {
  if (USAR_MOCK) return CATEGORIAS_EXEMPLO;
  return apiFetch<Categoria[]>("/categorias", { cache: "no-store" });
}

/** Diz se o catalogo esta em modo de exemplo, para a UI avisar o usuario. */
export const catalogoEhMock = () => USAR_MOCK;
