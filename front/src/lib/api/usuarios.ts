import "server-only";

import { apiFetch } from "./client";
import type { Usuario } from "@/types/api";

const SEM_CACHE = { cache: "no-store" as const };

export const usuarioLogado = () => apiFetch<Usuario>("/usuarios/me", SEM_CACHE);

export const listarUsuarios = () => apiFetch<Usuario[]>("/usuarios", SEM_CACHE);

export const buscarUsuario = (id: number) =>
  apiFetch<Usuario>(`/usuarios/${id}`, SEM_CACHE);

export const atualizarUsuario = (id: number, dados: { nome: string; email: string }) =>
  apiFetch<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

export const alterarSenha = (
  id: number,
  dados: { senhaAtual: string; novaSenha: string },
) =>
  apiFetch<void>(`/usuarios/${id}/senha`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });

export const excluirConta = (id: number) =>
  apiFetch<void>(`/usuarios/${id}`, { method: "DELETE" });

/** `foto` e um data URI em base64 (PNG ou JPG). */
export const atualizarFoto = (id: number, foto: string) =>
  apiFetch<Usuario>(`/usuarios/${id}/foto`, {
    method: "PUT",
    body: JSON.stringify({ foto }),
  });

export const removerFoto = (id: number) =>
  apiFetch<Usuario>(`/usuarios/${id}/foto`, { method: "DELETE" });
