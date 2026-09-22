import type { ErroResponse } from "@/types/api";

/** Erro vindo da API, ja com o status e os campos invalidos separados. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public campos?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Le o corpo de erro da API e lanca um ApiError. */
export async function parseErro(res: Response): Promise<never> {
  let corpo: Partial<ErroResponse> = {};
  try {
    corpo = await res.json();
  } catch {
    // resposta sem corpo (204, erro de rede, HTML de proxy...)
  }

  throw new ApiError(
    res.status,
    corpo.mensagem ?? "Não foi possível completar a operação",
    corpo.campos,
  );
}

/** Mensagem pronta para mostrar ao usuario, seja qual for o erro. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  if (erro instanceof Error && erro.message.includes("fetch")) {
    return "Não foi possível conectar ao servidor. A API está rodando?";
  }
  return "Erro inesperado. Tente novamente.";
}
