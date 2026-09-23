import Link from "next/link";

import { AlternarTema } from "@/components/comum/alternar-tema";
import { AvatarFlutuante } from "@/components/layout/avatar-flutuante";
import { LogoComNome } from "@/components/comum/logo";
import { MenuUsuario } from "@/components/layout/menu-usuario";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarMobile } from "@/components/layout/sidebar-mobile";
import { comGuarda } from "@/lib/api/guard";
import { usuarioLogado } from "@/lib/api/usuarios";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Se o token expirou, comGuarda derruba a sessão e manda para o login
  const usuario = await comGuarda(usuarioLogado);
  const ehArtista = usuario.tipo === "ARTISTA";

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar do desktop, com botao de recolher */}
      <Sidebar ehArtista={ehArtista} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Header so no mobile: e ele que carrega o botao do menu lateral. No
          desktop a sidebar ja esta sempre visivel, entao o lugar do menu da conta
          e o avatar flutuante — e a pagina ganha o degrade inteiro.
        */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2">
            <SidebarMobile ehArtista={ehArtista} />
            <Link href="/playlists">
              <LogoComNome altura={36} />
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <AlternarTema />
            <MenuUsuario usuario={usuario} />
          </div>
        </header>

        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
          {/*
            Brilho verde no topo da área de conteúdo, ecoando o degrade do login.
            No desktop, sem header por cima, ele aparece inteiro.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-marca/12 to-transparent"
          />
          {children}
        </main>
      </div>

      {/* So no desktop — no mobile o menu da conta fica no header */}
      <AvatarFlutuante usuario={usuario} />
    </div>
  );
}
