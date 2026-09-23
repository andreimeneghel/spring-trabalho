"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ListMusic, Mic2, Star, User } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/playlists", rotulo: "Minhas playlists", Icone: ListMusic },
  { href: "/descobrir", rotulo: "Descobrir", Icone: Compass },
  { href: "/avaliacoes", rotulo: "Minhas avaliações", Icone: Star },
  /** So aparece para quem tem conta de ARTISTA. */
  { href: "/artista", rotulo: "Área do artista", Icone: Mic2, soArtista: true },
  { href: "/perfil", rotulo: "Perfil", Icone: User },
];

export function NavLinks({
  aoNavegar,
  /** Na sidebar recolhida mostra so o icone, com o rotulo no hover. */
  recolhida = false,
  ehArtista = false,
}: {
  aoNavegar?: () => void;
  recolhida?: boolean;
  ehArtista?: boolean;
}) {
  const pathname = usePathname();
  const links = LINKS.filter((l) => !l.soArtista || ehArtista);

  return (
    <nav
      className={cn(recolhida ? "space-y-2" : "space-y-1")}
      aria-label="Navegação principal"
    >
      {links.map(({ href, rotulo, Icone }) => {
        const ativo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={aoNavegar}
            aria-current={ativo ? "page" : undefined}
            title={recolhida ? rotulo : undefined}
            className={cn(
              "group/link relative flex items-center gap-3 rounded-md text-sm transition-colors",
              recolhida ? "justify-center px-2 py-2.5" : "px-3 py-2",
              ativo
                ? "bg-superficie-alta font-bold text-foreground"
                : "text-texto-suave hover:bg-superficie hover:text-foreground",
            )}
          >
            <Icone
              className={cn(
                "shrink-0",
                recolhida ? "size-5" : "size-4",
                ativo && "text-marca dark:text-marca-clara",
              )}
            />

            {recolhida ? (
              // rotulo flutuante a direita, so no hover
              <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-superficie-alta px-2 py-1 text-xs font-bold text-foreground opacity-0 shadow-md transition-opacity group-hover/link:opacity-100">
                {rotulo}
              </span>
            ) : (
              rotulo
            )}
          </Link>
        );
      })}
    </nav>
  );
}
