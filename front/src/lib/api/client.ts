import "server-only";

import { lerToken } from "@/lib/auth/session";
import { parseErro } from "./errors";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

type Opcoes = Omit<RequestInit, "cache"> & {
  next?: { tags?: string[]; revalidate?: number | false };
  cache?: RequestCache;
  /** Envia a requisicao sem o header Authorization (login e registro). */
  semAuth?: boolean;
};

/**
 * Unico ponto de saida para a API.
 *
 * Roda apenas no servidor (o "server-only" faz o build falhar se alguem importar
 * isto num Client Component), entao o token nunca chega ao navegador.
 */
export async function apiFetch<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { semAuth, headers, ...resto } = opcoes;
  const token = semAuth ? null : await lerToken();

  const res = await fetch(`${API_URL}${caminho}`, {
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) await parseErro(res);

  // 204 No Content (DELETE, PATCH de senha)
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
