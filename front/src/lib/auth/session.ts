import "server-only";

import { cookies } from "next/headers";

export const NOME_COOKIE = "soundhub_sessao";

/**
 * O token fica num cookie httpOnly: o JavaScript da pagina nunca o enxerga,
 * entao um XSS nao consegue rouba-lo.
 */
export async function criarSessao(token: string, expiraEmSegundos: number) {
  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiraEmSegundos,
  });
}

export async function lerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(NOME_COOKIE)?.value ?? null;
}

export async function destruirSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE);
}
