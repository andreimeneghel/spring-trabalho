"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Disc3, ListMusic, Mic2 } from "lucide-react";

import { cn } from "@/lib/utils";

const ABAS = [
  { chave: "playlists", rotulo: "Playlists", Icone: ListMusic },
  { chave: "artistas", rotulo: "Artistas", Icone: Mic2 },
  { chave: "albuns", rotulo: "Álbuns", Icone: Disc3 },
] as const;

export type AbaDescobrir = (typeof ABAS)[number]["chave"];

/**
 * A aba vive na URL (`?aba=`) para o estado sobreviver ao recarregar e para a
 * pagina continuar sendo um Server Component. O termo de busca e preservado
 * ao trocar de aba.
 */
export function AbasDescobrir({ atual }: { atual: AbaDescobrir }) {
  const params = useSearchParams();
  const termo = params.get("q") ?? "";

  return (
    <div
      role="tablist"
      aria-label="Tipo de conteúdo"
      className="inline-flex gap-1 rounded-lg border border-border bg-superficie p-1"
    >
      {ABAS.map(({ chave, rotulo, Icone }) => {
        const ativa = chave === atual;
        const href = termo
          ? `/descobrir?aba=${chave}&q=${encodeURIComponent(termo)}`
          : `/descobrir?aba=${chave}`;

        return (
          <Link
            key={chave}
            href={href}
            role="tab"
            aria-selected={ativa}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              ativa
                ? "bg-superficie-alta font-bold text-foreground"
                : "text-texto-suave hover:text-foreground",
            )}
          >
            <Icone
              className={cn(
                "size-4",
                ativa && "text-marca dark:text-marca-clara",
              )}
            />
            {rotulo}
          </Link>
        );
      })}
    </div>
  );
}
