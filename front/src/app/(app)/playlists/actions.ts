"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import * as api from "@/lib/api/playlists";
import { ApiError, mensagemDeErro } from "@/lib/api/errors";
import { playlistSchema } from "@/lib/schemas";

export interface EstadoPlaylist {
  erro?: string;
  campos?: Record<string, string>;
}

function lerFormulario(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim() || undefined,
    publica: formData.get("publica") === "on",
  };
}

function errosDoSchema(issues: { path: PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const campo = String(issue.path[0]);
    campos[campo] ??= issue.message;
  }
  return campos;
}

export async function criarPlaylistAction(
  _anterior: EstadoPlaylist,
  formData: FormData,
): Promise<EstadoPlaylist> {
  const validado = playlistSchema.safeParse(lerFormulario(formData));
  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  let novoId: number;
  try {
    const playlist = await api.criarPlaylist(validado.data);
    novoId = playlist.id;
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/playlists");
  redirect(`/playlists/${novoId}`);
}

export async function atualizarPlaylistAction(
  id: number,
  _anterior: EstadoPlaylist,
  formData: FormData,
): Promise<EstadoPlaylist> {
  const validado = playlistSchema.safeParse(lerFormulario(formData));
  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.atualizarPlaylist(id, validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/playlists");
  revalidatePath(`/playlists/${id}`);
  redirect(`/playlists/${id}`);
}

export async function excluirPlaylistAction(id: number) {
  try {
    await api.excluirPlaylist(id);
  } catch (erro) {
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/playlists");
  redirect("/playlists");
}

export async function adicionarMusicaAction(playlistId: number, musicaId: number) {
  try {
    await api.adicionarMusica(playlistId, musicaId);
    revalidatePath(`/playlists/${playlistId}`);
    revalidatePath("/playlists");
    return { ok: true as const };
  } catch (erro) {
    return { ok: false as const, erro: mensagemDeErro(erro) };
  }
}

export async function removerMusicaAction(playlistId: number, musicaId: number) {
  try {
    await api.removerMusica(playlistId, musicaId);
    revalidatePath(`/playlists/${playlistId}`);
    revalidatePath("/playlists");
    return { ok: true as const };
  } catch (erro) {
    return { ok: false as const, erro: mensagemDeErro(erro) };
  }
}
