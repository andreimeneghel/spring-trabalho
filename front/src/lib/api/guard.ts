import "server-only";

import { redirect } from "next/navigation";
import { destruirSessao } from "@/lib/auth/session";
import { ApiError } from "./errors";

/**
 * Envolve uma leitura da API: se o token expirou (401), derruba a sessao e
 * manda para o login em vez de estourar uma tela de erro.
 */
export async function comGuarda<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) {
      await destruirSessao();
      redirect("/login?expirado=1");
    }
    throw erro;
  }
}
