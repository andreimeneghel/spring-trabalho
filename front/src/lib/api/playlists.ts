import "server-only";

import { apiFetch } from "./client";
import type { PlaylistDetalhe, PlaylistResumo } from "@/types/api";

export interface PlaylistInput {
  nome: string;
  descricao?: string;
  publica?: boolean;
  /** Data URI base64 (PNG ou JPG). String vazia ou omitido = sem capa. */
  capa?: string;
}

/**
 * Dado autenticado nao pode ir para cache compartilhado: o token muda por usuario,
 * entao cachear sem escopo entregaria a playlist de um para outro. Por isso no-store.
 */
const SEM_CACHE = { cache: "no-store" as const };

export const listarPlaylists = () =>
  apiFetch<PlaylistResumo[]>("/playlists", SEM_CACHE);

export const listarMinhasPlaylists = () =>
  apiFetch<PlaylistResumo[]>("/playlists/minhas", SEM_CACHE);

export const listarPlaylistsDoUsuario = (usuarioId: number) =>
  apiFetch<PlaylistResumo[]>(`/playlists/usuario/${usuarioId}`, SEM_CACHE);

export const buscarPlaylistsPorNome = (nome: string) =>
  apiFetch<PlaylistResumo[]>(
    `/playlists/busca?nome=${encodeURIComponent(nome)}`,
    SEM_CACHE,
  );

export const buscarPlaylist = (id: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}`, SEM_CACHE);

export const criarPlaylist = (dados: PlaylistInput) =>
  apiFetch<PlaylistDetalhe>("/playlists", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarPlaylist = (id: number, dados: PlaylistInput) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirPlaylist = (id: number) =>
  apiFetch<void>(`/playlists/${id}`, { method: "DELETE" });

/** A resposta ja traz a playlist inteira atualizada — nao precisa refazer o GET. */
export const adicionarMusica = (id: number, musicaId: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}/musicas`, {
    method: "POST",
    body: JSON.stringify({ musicaId }),
  });

export const removerMusica = (id: number, musicaId: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}/musicas/${musicaId}`, {
    method: "DELETE",
  });
