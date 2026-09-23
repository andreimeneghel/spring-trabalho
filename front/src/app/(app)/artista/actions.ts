"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import * as api from "@/lib/api/artistas";
import { ApiError, mensagemDeErro } from "@/lib/api/errors";
import { albumSchema, artistaSchema } from "@/lib/schemas";

export interface EstadoForm {
  erro?: string;
  campos?: Record<string, string>;
}

function errosDoSchema(issues: { path: PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const issue of issues) {
    const campo = String(issue.path[0]);
    campos[campo] ??= issue.message;
  }
  return campos;
}

// ===== Perfil de artista =====

export async function criarArtistaAction(
  _anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const validado = artistaSchema.safeParse({
    nomeArtistico: String(formData.get("nomeArtistico") ?? "").trim(),
    biografia: String(formData.get("biografia") ?? "").trim() || undefined,
    foto: String(formData.get("foto") ?? "") || undefined,
  });

  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.criarArtista(validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/artista");
  redirect("/artista");
}

export async function atualizarArtistaAction(
  id: number,
  _anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const validado = artistaSchema.safeParse({
    nomeArtistico: String(formData.get("nomeArtistico") ?? "").trim(),
    biografia: String(formData.get("biografia") ?? "").trim() || undefined,
    foto: String(formData.get("foto") ?? "") || undefined,
  });

  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.atualizarArtista(id, validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/artista");
  redirect("/artista");
}

// ===== Album =====

function lerAlbum(formData: FormData) {
  const ano = String(formData.get("anoLancamento") ?? "").trim();
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    anoLancamento: ano ? Number(ano) : undefined,
    capa: String(formData.get("capa") ?? "") || undefined,
  };
}

export async function criarAlbumAction(
  _anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const validado = albumSchema.safeParse(lerAlbum(formData));
  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.criarAlbum(validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/artista");
  redirect("/artista");
}

export async function atualizarAlbumAction(
  id: number,
  _anterior: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const validado = albumSchema.safeParse(lerAlbum(formData));
  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.atualizarAlbum(id, validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/artista");
  redirect("/artista");
}

export async function excluirAlbumAction(id: number) {
  try {
    await api.excluirAlbum(id);
  } catch (erro) {
    return { ok: false as const, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/artista");
  return { ok: true as const };
}
