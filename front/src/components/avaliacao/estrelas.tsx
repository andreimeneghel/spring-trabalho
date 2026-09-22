"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Exibicao somente leitura. */
export function EstrelasLeitura({
  nota,
  tamanho = "size-4",
  className,
}: {
  nota: number;
  tamanho?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Nota ${nota} de 5`}
    >
      {[1, 2, 3, 4, 5].map((valor) => (
        <Star
          key={valor}
          aria-hidden="true"
          className={cn(
            tamanho,
            valor <= Math.round(nota)
              ? "fill-estrela text-estrela"
              : "text-texto-fraco",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Entrada de nota. Usa radio de verdade (visualmente escondido) para funcionar
 * com teclado e leitor de tela.
 */
export function EstrelasInput({
  nome = "nota",
  valorInicial = 0,
  aoMudar,
}: {
  nome?: string;
  valorInicial?: number;
  aoMudar?: (nota: number) => void;
}) {
  const grupoId = useId();
  const [nota, setNota] = useState(valorInicial);
  const [hover, setHover] = useState(0);

  const emDestaque = hover || nota;

  return (
    <fieldset
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      <legend className="sr-only">Nota de 1 a 5</legend>

      {[1, 2, 3, 4, 5].map((valor) => {
        const id = `${grupoId}-${valor}`;
        return (
          <span key={valor} className="relative">
            <input
              type="radio"
              id={id}
              name={nome}
              value={valor}
              checked={nota === valor}
              onChange={() => {
                setNota(valor);
                aoMudar?.(valor);
              }}
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              onMouseEnter={() => setHover(valor)}
              className="block cursor-pointer p-0.5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marca-clara"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  valor <= emDestaque
                    ? "fill-estrela text-estrela"
                    : "text-texto-fraco hover:text-texto-suave",
                )}
              />
              <span className="sr-only">
                {valor} {valor === 1 ? "estrela" : "estrelas"}
              </span>
            </label>
          </span>
        );
      })}
    </fieldset>
  );
}
