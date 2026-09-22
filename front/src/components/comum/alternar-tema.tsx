"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

const semInscricao = () => () => {};

/**
 * Diz se já estamos no cliente. O tema só e conhecido la — renderizar o icone
 * no servidor causaria diferenca entre servidor e cliente (erro de hidratacao).
 */
function useMontado() {
  return useSyncExternalStore(
    semInscricao,
    () => true, // cliente
    () => false, // servidor
  );
}

export function AlternarTema() {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useMontado();
  // No servidor o tema ainda nao e conhecido: qualquer texto que dependa dele
  // precisa esperar a montagem, senao o HTML do servidor difere do cliente.
  const escuro = montado && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      aria-label={
        montado
          ? escuro
            ? "Mudar para o tema claro"
            : "Mudar para o tema escuro"
          : "Alternar tema"
      }
      title={montado ? (escuro ? "Tema claro" : "Tema escuro") : "Alternar tema"}
    >
      {montado ? (
        escuro ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
