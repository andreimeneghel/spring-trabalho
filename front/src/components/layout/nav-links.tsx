"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ListMusic, Star, User } from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/playlists", rotulo: "Minhas playlists", Icone: ListMusic },
  { href: "/descobrir", rotulo: "Descobrir", Icone: Compass },
  { href: "/avaliacoes", rotulo: "Minhas avaliações", Icone: Star },
  { href: "/perfil", rotulo: "Perfil", Icone: User },
];

export function NavLinks({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Navegação principal">
      {LINKS.map(({ href, rotulo, Icone }) => {
        const ativo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={aoNavegar}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              ativo
                ? "bg-superficie-alta font-bold text-foreground"
                : "text-texto-suave hover:bg-superficie hover:text-foreground",
            )}
          >
            <Icone className={cn("size-4", ativo && "text-marca dark:text-marca-clara")} />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
