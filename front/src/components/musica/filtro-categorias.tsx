import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Categoria } from "@/types/api";

/**
 * Filtro por categoria da aba de músicas. Vive na URL (`?categoria=`) para a
 * página continuar sendo Server Component — mesma ideia das abas.
 */
export function FiltroCategorias({
  categorias,
  selecionada,
  termo,
}: {
  categorias: Categoria[];
  selecionada?: number;
  termo?: string;
}) {
  const href = (categoriaId?: number) => {
    const params = new URLSearchParams({ aba: "musicas" });
    if (termo) params.set("q", termo);
    if (categoriaId) params.set("categoria", String(categoriaId));
    return `/descobrir?${params}`;
  };

  const classe = (ativa: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-sm transition-colors",
      ativa
        ? "border-marca bg-marca/15 font-bold text-marca dark:text-marca-clara"
        : "border-border text-texto-suave hover:border-texto-fraco",
    );

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
      <Link href={href()} aria-current={!selecionada} className={classe(!selecionada)}>
        Todas
      </Link>

      {categorias.map((categoria) => (
        <Link
          key={categoria.id}
          href={href(categoria.id)}
          aria-current={selecionada === categoria.id}
          className={classe(selecionada === categoria.id)}
        >
          {categoria.nome}
        </Link>
      ))}
    </div>
  );
}
