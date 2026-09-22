import "server-only";

import { apiFetch } from "./client";
import type { Avaliacao, MediaAvaliacao } from "@/types/api";

export interface AvaliacaoInput {
  nota: number;
  comentario?: string;
}

const SEM_CACHE = { cache: "no-store" as const };

export const listarAvaliacoesDaMusica = (musicaId: number) =>
  apiFetch<Avaliacao[]>(`/musicas/${musicaId}/avaliacoes`, SEM_CACHE);

export const buscarMedia = (musicaId: number) =>
  apiFetch<MediaAvaliacao>(`/musicas/${musicaId}/avaliacoes/media`, SEM_CACHE);

export const listarMinhasAvaliacoes = () =>
  apiFetch<Avaliacao[]>("/avaliacoes/minhas", SEM_CACHE);

export const buscarAvaliacao = (id: number) =>
  apiFetch<Avaliacao>(`/avaliacoes/${id}`, SEM_CACHE);

export const criarAvaliacao = (musicaId: number, dados: AvaliacaoInput) =>
  apiFetch<Avaliacao>(`/musicas/${musicaId}/avaliacoes`, {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarAvaliacao = (id: number, dados: AvaliacaoInput) =>
  apiFetch<Avaliacao>(`/avaliacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirAvaliacao = (id: number) =>
  apiFetch<void>(`/avaliacoes/${id}`, { method: "DELETE" });
