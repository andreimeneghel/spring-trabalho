"use server";

import { revalidatePath } from "next/cache";

import * as api from "@/lib/api/avaliacoes";
import { ApiError, mensagemDeErro } from "@/lib/api/errors";
import { avaliacaoSchema } from "@/lib/schemas";

export interface ResultadoAvaliacao {
  ok: boolean;
  erro?: string;
  /** 409: o usuario ja avaliou esta musica — a UI deve alternar para edicao. */
  jaAvaliou?: boolean;
}

export async function criarAvaliacaoAction(
  musicaId: number,
  nota: number,
  comentario: string,
): Promise<ResultadoAvaliacao> {
  const validado = avaliacaoSchema.safeParse({
    nota,
    comentario: comentario.trim() || undefined,
  });

  if (!validado.success) {
    return { ok: false, erro: validado.error.issues[0]?.message };
  }

  try {
    await api.criarAvaliacao(musicaId, validado.data);
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 409) {
      return { ok: false, erro: erro.message, jaAvaliou: true };
    }
    return { ok: false, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/avaliacoes");
  return { ok: true };
}

export async function atualizarAvaliacaoAction(
  id: number,
  nota: number,
  comentario: string,
): Promise<ResultadoAvaliacao> {
  const validado = avaliacaoSchema.safeParse({
    nota,
    comentario: comentario.trim() || undefined,
  });

  if (!validado.success) {
    return { ok: false, erro: validado.error.issues[0]?.message };
  }

  try {
    await api.atualizarAvaliacao(id, validado.data);
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/avaliacoes");
  return { ok: true };
}

export async function excluirAvaliacaoAction(id: number): Promise<ResultadoAvaliacao> {
  try {
    await api.excluirAvaliacao(id);
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/avaliacoes");
  return { ok: true };
}
