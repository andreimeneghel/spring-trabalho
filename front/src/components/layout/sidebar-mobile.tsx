"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { NavLinks } from "./nav-links";
import { LogoComNome } from "@/components/comum/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SidebarMobile({ ehArtista = false }: { ehArtista?: boolean }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="top-0 left-0 h-dvh max-w-64 translate-x-0 translate-y-0 rounded-none border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
        <DialogTitle className="sr-only">Navegação</DialogTitle>
        <div className="space-y-6 pt-2">
          <LogoComNome />
          <NavLinks aoNavegar={() => setAberto(false)} ehArtista={ehArtista} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
