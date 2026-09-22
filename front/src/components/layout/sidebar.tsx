"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Logo, LogoComNome } from "@/components/comum/logo";
import { NavLinks } from "./nav-links";
import { cn } from "@/lib/utils";

const CHAVE = "soundhub_sidebar_recolhida";
/**
 * A preferencia vive no localStorage, que e estado externo ao React —
 * useSyncExternalStore e a forma correta de ler (e evita o setState em efeito,
 * que o React 19 acusa como erro).
 */
const store = {
  ouvintes: new Set<() => void>(),

  inscrever(ouvinte: () => void) {
    store.ouvintes.add(ouvinte);
    return () => store.ouvintes.delete(ouvinte);
  },

  ler() {
    try {
      return localStorage.getItem(CHAVE) === "1";
    } catch {
      // localStorage bloqueado (aba anonima, cookies desativados)
      return false;
    }
  },

  /** No servidor a sidebar sempre comeca expandida. */
  lerNoServidor() {
    return false;
  },

  alternar() {
    const novo = !store.ler();
    try {
      localStorage.setItem(CHAVE, novo ? "1" : "0");
    } catch {
      // sem persistencia: a sessao atual continua funcionando
    }
    store.ouvintes.forEach((ouvinte) => ouvinte());
  },
};

export function Sidebar() {
  const recolhida = useSyncExternalStore(
    store.inscrever,
    store.ler,
    store.lerNoServidor,
  );
  const alternar = store.alternar;

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col justify-between border-r border-border bg-sidebar py-4 transition-[width] duration-200 lg:flex",
        recolhida ? "w-20 px-3" : "w-60 px-4",
      )}
    >
      <div className={cn(recolhida ? "space-y-8" : "space-y-6")}>
        <Link
          href="/playlists"
          className="flex justify-center py-1"
          aria-label="SoundHub — inicio"
        >
          {/* recolhida: so o simbolo, sem o nome embaixo */}
          {recolhida ? <Logo tamanho={34} /> : <LogoComNome altura={56} />}
        </Link>

        <NavLinks recolhida={recolhida} />
      </div>

      {!recolhida && (
        <p className="text-center text-xs leading-relaxed text-texto-fraco">
          
          <br />
          &copy; 2024 SoundHub
        </p>
      )}

      {/* Botao na divisa da sidebar com o conteudo */}
      <button
        type="button"
        onClick={alternar}
        aria-label={recolhida ? "Expandir menu lateral" : "Recolher menu lateral"}
        title={recolhida ? "Expandir menu" : "Recolher menu"}
        className="absolute -right-4 top-7 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-superficie text-texto-suave shadow-md transition-colors hover:border-marca hover:text-marca dark:hover:text-marca-clara"
      >
        {recolhida ? (
          <PanelLeftOpen className="size-4.5" />
        ) : (
          <PanelLeftClose className="size-4.5" />
        )}
      </button>
    </aside>
  );
}
