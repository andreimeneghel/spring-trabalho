"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { logoutAction } from "@/lib/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { iniciais } from "@/lib/utils/formato";
import type { Usuario } from "@/types/api";

const semInscricao = () => () => {};

/** true so depois que o componente montou no cliente. */
function useMontado() {
  return useSyncExternalStore(
    semInscricao,
    () => true,
    () => false,
  );
}

/** Posicao de cada bolinha em relacao ao avatar, quando o leque abre. */
const POSICOES = [
  { x: -8, y: -76 }, // em cima
  { x: -62, y: -56 }, // diagonal
  { x: -84, y: -6 }, // ao lado
] as const;

/**
 * Avatar flutuante no canto inferior direito. Ao clicar, abre um leque de
 * bolinhas — perfil, tema e sair — cada uma com o rotulo aparecendo no hover.
 * So aparece no desktop: no mobile o menu da conta fica no header.
 */
export function AvatarFlutuante({ usuario }: { usuario: Usuario }) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  // o tema so e conhecido no cliente: antes de montar, qualquer texto que
  // dependa dele divergiria do HTML renderizado no servidor
  const montado = useMontado();
  const escuro = montado && resolvedTheme === "dark";

  // fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const acoes = [
    {
      chave: "perfil",
      rotulo: "Perfil",
      Icone: UserIcon,
      aoClicar: () => {
        setAberto(false);
        router.push("/perfil");
      },
    },
    {
      chave: "tema",
      // texto neutro ate montar: o servidor nao sabe qual tema esta ativo
      rotulo: montado ? (escuro ? "Tema claro" : "Tema escuro") : "Alternar tema",
      Icone: escuro ? Sun : Moon,
      // nao fecha: da para ver a mudanca acontecer
      aoClicar: () => setTheme(escuro ? "light" : "dark"),
    },
    {
      chave: "sair",
      rotulo: "Sair",
      Icone: LogOut,
      destrutivo: true,
      // a Server Action pode ser chamada direto, sem <form>
      aoClicar: () => void logoutAction(),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-30 hidden lg:block"
    >
      {/* Bolinhas do leque */}
      {acoes.map(({ chave, rotulo, Icone, destrutivo, aoClicar }, i) => (
        <div
          key={chave}
          className={cn(
            // hover:z-20 leva o rotulo para a frente das outras bolinhas:
            // como sao irmas, sem isso a ordem do DOM decide quem cobre quem
            "group/bolinha absolute bottom-0 right-0 transition-all duration-300 ease-out hover:z-20",
            aberto
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          style={{
            transform: aberto
              ? `translate(${POSICOES[i].x}px, ${POSICOES[i].y}px)`
              : "translate(0, 0)",
            // abre em cascata, fecha de uma vez
            transitionDelay: aberto ? `${i * 55}ms` : "0ms",
          }}
        >
          {/* Rotulo: aparece a esquerda da bolinha no hover */}
          <span
            role="tooltip"
            className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-superficie-alta px-2 py-1 text-xs font-bold text-foreground opacity-0 shadow-md transition-opacity group-hover/bolinha:opacity-100"
          >
            {rotulo}
          </span>

          <button
            type="button"
            onClick={aoClicar}
            tabIndex={aberto ? 0 : -1}
            aria-label={rotulo}
            className={cn(
              "flex size-11 cursor-pointer items-center justify-center rounded-full border shadow-lg outline-none transition-colors hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              destrutivo
                ? "border-destructive/30 bg-superficie text-destructive hover:bg-destructive hover:text-white"
                : "border-border bg-superficie text-foreground hover:border-marca hover:text-marca dark:hover:text-marca-clara",
            )}
          >
            <Icone className="size-4" />
          </button>
        </div>
      ))}

      {/* Avatar */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar menu da conta" : "Abrir menu da conta"}
        title={`${usuario.nome} · ${usuario.email}`}
        className="group/avatar relative cursor-pointer rounded-full shadow-lg shadow-black/30 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar
          className={cn(
            "size-12 border-2 transition-colors",
            aberto ? "border-marca" : "border-marca/60",
          )}
        >
          {usuario.foto && <AvatarImage src={usuario.foto} alt="" />}
          <AvatarFallback className="bg-marca text-sm font-bold text-white">
            {iniciais(usuario.nome)}
          </AvatarFallback>
        </Avatar>

        {/* Nome aparece no hover, so com o leque fechado */}
        {!aberto && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-superficie-alta px-2 py-1 text-xs font-bold text-foreground opacity-0 shadow-md transition-opacity group-hover/avatar:opacity-100">
            {usuario.nome}
          </span>
        )}
      </button>
    </div>
  );
}
