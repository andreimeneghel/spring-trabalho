import Link from "next/link";

import { AlternarTema } from "@/components/comum/alternar-tema";
import { LogoComNome } from "@/components/comum/logo";
import { MenuUsuario } from "@/components/layout/menu-usuario";
import { NavLinks } from "@/components/layout/nav-links";
import { SidebarMobile } from "@/components/layout/sidebar-mobile";
import { comGuarda } from "@/lib/api/guard";
import { usuarioLogado } from "@/lib/api/usuarios";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Se o token expirou, comGuarda derruba a sessão e manda para o login
  const usuario = await comGuarda(usuarioLogado);

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar fixa no desktop */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-sidebar p-4 lg:flex">
        <div className="space-y-6">
          <Link href="/playlists" className="block px-1">
            <LogoComNome />
          </Link>
          <NavLinks />
        </div>

        <p className="px-1 text-xs leading-relaxed text-texto-fraco">
          Projeto acadêmico
          <br />
          UNESC
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarMobile />
            <Link href="/playlists" className="lg:hidden">
              <LogoComNome altura={36} />
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <AlternarTema />
            <MenuUsuario usuario={usuario} />
          </div>
        </header>

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/*
            Brilho verde sutil no topo da área de conteúdo, ecoando o degrade
            do login. Fica atrás de tudo e nao captura clique.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-marca/[0.09] to-transparent"
          />
          {children}
        </main>
      </div>
    </div>
  );
}
