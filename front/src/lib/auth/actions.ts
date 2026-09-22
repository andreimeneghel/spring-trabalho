"use server";

import { redirect } from "next/navigation";
import { criarSessao, destruirSessao } from "./session";
import { loginSchema, registroSchema } from "@/lib/schemas";
import type { ErroResponse, TokenResponse } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export interface EstadoFormulario {
  erro?: string;
  campos?: Record<string, string>;
}

/** Chama /auth/* sem passar pelo apiFetch, porque aqui ainda nao existe token. */
async function autenticar(
  rota: "/auth/login" | "/auth/registrar",
  corpo: unknown,
): Promise<{ ok: true; dados: TokenResponse } | { ok: false } & EstadoFormulario> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
      cache: "no-store",
    });
  } catch {
    return { ok: false, erro: "Não foi possível conectar ao servidor. A API está rodando?" };
  }

  if (!res.ok) {
    const erro: Partial<ErroResponse> = await res.json().catch(() => ({}));
    return {
      ok: false,
      erro: erro.mensagem ?? "Não foi possível completar a operação",
      campos: erro.campos,
    };
  }

  return { ok: true, dados: (await res.json()) as TokenResponse };
}

export async function loginAction(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = {
    email: String(formData.get("email") ?? "").trim(),
    senha: String(formData.get("senha") ?? ""),
  };

  const validado = loginSchema.safeParse(entrada);
  if (!validado.success) {
    const campos: Record<string, string> = {};
    for (const issue of validado.error.issues) {
      const campo = String(issue.path[0]);
      campos[campo] ??= issue.message;
    }
    return { campos };
  }

  const destino = String(formData.get("redirect") ?? "") || "/playlists";
  const resultado = await autenticar("/auth/login", validado.data);

  if (!resultado.ok) {
    return { erro: resultado.erro, campos: resultado.campos };
  }

  await criarSessao(resultado.dados.token, resultado.dados.expiraEmSegundos);

  // redirect() lanca uma excecao de controle: precisa ficar fora de try/catch
  redirect(destino);
}

export async function registrarAction(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    senha: String(formData.get("senha") ?? ""),
    tipo: String(formData.get("tipo") ?? "OUVINTE"),
  };

  const validado = registroSchema.safeParse(entrada);
  if (!validado.success) {
    const campos: Record<string, string> = {};
    for (const issue of validado.error.issues) {
      const campo = String(issue.path[0]);
      campos[campo] ??= issue.message;
    }
    return { campos };
  }

  const resultado = await autenticar("/auth/registrar", validado.data);

  if (!resultado.ok) {
    return { erro: resultado.erro, campos: resultado.campos };
  }

  await criarSessao(resultado.dados.token, resultado.dados.expiraEmSegundos);
  redirect("/playlists");
}

export async function logoutAction() {
  await destruirSessao();
  redirect("/login");
}
