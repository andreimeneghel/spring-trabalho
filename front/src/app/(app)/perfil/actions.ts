"use server";

import { revalidatePath } from "next/cache";

import * as api from "@/lib/api/usuarios";
import { ApiError, mensagemDeErro } from "@/lib/api/errors";
import { perfilSchema, senhaSchema } from "@/lib/schemas";

export interface EstadoPerfil {
  ok?: boolean;
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

export async function atualizarPerfilAction(
  id: number,
  _anterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const validado = perfilSchema.safeParse({
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  });

  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.atualizarUsuario(id, validado.data);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  revalidatePath("/perfil");
  return { ok: true };
}

export interface ResultadoFoto {
  ok: boolean;
  erro?: string;
}

/** `foto` chega como data URI (data:image/png;base64,...) montado no cliente. */
export async function atualizarFotoAction(
  id: number,
  foto: string,
): Promise<ResultadoFoto> {
  try {
    await api.atualizarFoto(id, foto);
  } catch (erro) {
    if (erro instanceof ApiError) {
      // o backend so aceita PNG/JPG ate 2MB
      return { ok: false, erro: erro.campos?.foto ?? erro.message };
    }
    return { ok: false, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");   // o avatar do header tambem muda
  return { ok: true };
}

export async function removerFotoAction(id: number): Promise<ResultadoFoto> {
  try {
    await api.removerFoto(id);
  } catch (erro) {
    return { ok: false, erro: mensagemDeErro(erro) };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function alterarSenhaAction(
  id: number,
  _anterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const validado = senhaSchema.safeParse({
    senhaAtual: String(formData.get("senhaAtual") ?? ""),
    novaSenha: String(formData.get("novaSenha") ?? ""),
    confirmar: String(formData.get("confirmar") ?? ""),
  });

  if (!validado.success) {
    return { campos: errosDoSchema(validado.error.issues) };
  }

  try {
    await api.alterarSenha(id, {
      senhaAtual: validado.data.senhaAtual,
      novaSenha: validado.data.novaSenha,
    });
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { erro: erro.message, campos: erro.campos };
    }
    return { erro: mensagemDeErro(erro) };
  }

  return { ok: true };
}
