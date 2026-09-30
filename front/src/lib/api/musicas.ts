import "server-only";

import { apiFetch } from "./client";
import type {
  Categoria,
  CategoriaDetalhe,
  MusicaDetalhe,
  MusicaResumo,
} from "@/types/api";

export interface MusicaInput {
  titulo: string;
  /** Em segundos. */
  duracao: number;
  /** Omitido ou null = single, sem album. O album tem que ser do proprio artista. */
  albumId?: number | null;
  /** Ids de categorias ja cadastradas. No maximo 5. */
  categoriaIds?: number[];
}

export interface CategoriaInput {
  nome: string;
}

/** Dado autenticado nao vai para cache compartilhado. */
const SEM_CACHE = { cache: "no-store" as const };

// ===== Musica =====

export const listarMusicas = () =>
  apiFetch<MusicaResumo[]>("/musicas", SEM_CACHE);

export const buscarMusicasPorTitulo = (titulo: string) =>
  apiFetch<MusicaResumo[]>(
    `/musicas/busca?titulo=${encodeURIComponent(titulo)}`,
    SEM_CACHE,
  );

/** Musicas do perfil de artista do usuario logado (400 se ele nao tiver perfil). */
export const listarMinhasMusicas = () =>
  apiFetch<MusicaResumo[]>("/musicas/minhas", SEM_CACHE);

export const listarMusicasDoArtista = (artistaId: number) =>
  apiFetch<MusicaResumo[]>(`/musicas/artista/${artistaId}`, SEM_CACHE);

export const listarMusicasDoAlbum = (albumId: number) =>
  apiFetch<MusicaResumo[]>(`/musicas/album/${albumId}`, SEM_CACHE);

export const listarMusicasDaCategoria = (categoriaId: number) =>
  apiFetch<MusicaResumo[]>(`/musicas/categoria/${categoriaId}`, SEM_CACHE);

export const buscarMusica = (id: number) =>
  apiFetch<MusicaDetalhe>(`/musicas/${id}`, SEM_CACHE);

/** A musica e vinculada ao perfil de artista do usuario logado. */
export const criarMusica = (dados: MusicaInput) =>
  apiFetch<MusicaDetalhe>("/musicas", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarMusica = (id: number, dados: MusicaInput) =>
  apiFetch<MusicaDetalhe>(`/musicas/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirMusica = (id: number) =>
  apiFetch<void>(`/musicas/${id}`, { method: "DELETE" });

// ===== Categoria =====

export const listarCategorias = () =>
  apiFetch<Categoria[]>("/categorias", SEM_CACHE);

export const buscarCategoria = (id: number) =>
  apiFetch<CategoriaDetalhe>(`/categorias/${id}`, SEM_CACHE);

export const criarCategoria = (dados: CategoriaInput) =>
  apiFetch<CategoriaDetalhe>("/categorias", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const atualizarCategoria = (id: number, dados: CategoriaInput) =>
  apiFetch<CategoriaDetalhe>(`/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const excluirCategoria = (id: number) =>
  apiFetch<void>(`/categorias/${id}`, { method: "DELETE" });
