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
  const escuro = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      aria-label={escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      title={escuro ? "Tema claro" : "Tema escuro"}
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
