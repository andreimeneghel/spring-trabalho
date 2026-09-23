import "server-only";

import { apiFetch } from "./client";
import type {
  AlbumDetalhe,
  AlbumResumo,
  ArtistaDetalhe,
  ArtistaResumo,
} from "@/types/api";

export interface ArtistaInput {
  nomeArtistico: string;
  biografia?: string;
}

export interface AlbumInput {
  titulo: string;
  anoLancamento?: number;
}

/** Dado autenticado nao vai para cache compartilhado. */
const SEM_CACHE = { cache: "no-store" as const };

// ===== Artista =====

export const listarArtistas = () =>
  apiFetch<ArtistaResumo[]>("/artistas", SEM_CACHE);

export const buscarArtistasPorNome = (nome: string) =>
  apiFetch<ArtistaResumo[]>(
    `/artistas/busca?nome=${encodeURIComponent(nome)}`,
    SEM_CACHE,
  );

/** 404 quando o usuario logado ainda nao criou o perfil de artista. */
export const meuPerfilArtista = () =>
  apiFetch<ArtistaDetalhe>("/artistas/meu-perfil", SEM_CACHE);

export const buscarArtista = (id: number) =>
  apiFetch<ArtistaDetalhe>(`/artistas/${id}`, SEM_CACHE);

/** O perfil e criado para o usuario logado — `usuarioId` nao vai no body. */
export const criarArtista = (dados: ArtistaInput) =>
  apiFetch<ArtistaDetalhe>("/artistas", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarArtista = (id: number, dados: ArtistaInput) =>
  apiFetch<ArtistaDetalhe>(`/artistas/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirArtista = (id: number) =>
  apiFetch<void>(`/artistas/${id}`, { method: "DELETE" });

// ===== Album =====

export const listarAlbuns = () => apiFetch<AlbumResumo[]>("/albuns", SEM_CACHE);

export const buscarAlbunsPorTitulo = (titulo: string) =>
  apiFetch<AlbumResumo[]>(
    `/albuns/busca?titulo=${encodeURIComponent(titulo)}`,
    SEM_CACHE,
  );

export const listarAlbunsDoArtista = (artistaId: number) =>
  apiFetch<AlbumResumo[]>(`/albuns/artista/${artistaId}`, SEM_CACHE);

export const buscarAlbum = (id: number) =>
  apiFetch<AlbumDetalhe>(`/albuns/${id}`, SEM_CACHE);

/** O album e vinculado ao perfil de artista do usuario logado. */
export const criarAlbum = (dados: AlbumInput) =>
  apiFetch<AlbumDetalhe>("/albuns", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarAlbum = (id: number, dados: AlbumInput) =>
  apiFetch<AlbumDetalhe>(`/albuns/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirAlbum = (id: number) =>
  apiFetch<void>(`/albuns/${id}`, { method: "DELETE" });
