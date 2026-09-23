"use client";

import { useRef, useState } from "react";
import { ImagePlus, Music2, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2MB

/**
 * Escolhe uma imagem e devolve um data URI base64 num input hidden, para o
 * formulario enviar junto com os outros campos. Usado na capa da playlist, na
 * capa do album e na foto do artista.
 */
export function SeletorImagem({
  name,
  valorInicial,
  rotulo = "Imagem",
  descricao = "PNG ou JPG, até 2MB. Opcional.",
  Icone = Music2,
  /** `circulo` para foto de perfil, `quadrado` para capa. */
  formato = "quadrado",
}: {
  name: string;
  valorInicial?: string | null;
  rotulo?: string;
  descricao?: string;
  Icone?: LucideIcon;
  formato?: "quadrado" | "circulo";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imagem, setImagem] = useState<string>(valorInicial ?? "");

  function escolher(arquivo: File) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.error("Formato inválido. Envie uma imagem PNG ou JPG.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    const leitor = new FileReader();
    leitor.onerror = () => toast.error("Não foi possível ler o arquivo.");
    leitor.onload = () => setImagem(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  const arredondamento = formato === "circulo" ? "rounded-full" : "rounded-md";

  return (
    <div className="flex items-center gap-4">
      {/* o valor vai para o FormData junto com os outros campos */}
      <input type="hidden" name={name} value={imagem} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={imagem ? `Trocar ${rotulo.toLowerCase()}` : `Escolher ${rotulo.toLowerCase()}`}
        className={cn(
          "group relative size-24 shrink-0 cursor-pointer overflow-hidden border border-border bg-superficie-alta transition-colors hover:border-texto-fraco",
          arredondamento,
        )}
      >
        {imagem ? (
          // a imagem vem em base64, entao <img> comum (o next/image nao otimiza data URI)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Icone className="size-8 text-texto-fraco" aria-hidden="true" />
          </span>
        )}

        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100",
            arredondamento,
          )}
        >
          <ImagePlus className="size-5 text-white" aria-hidden="true" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) escolher(arquivo);
          e.target.value = ""; // permite reenviar o mesmo arquivo
        }}
      />

      <div className="space-y-2">
        <div>
          <p className="text-sm font-bold">{rotulo}</p>
          <p className="text-xs text-texto-suave">{descricao}</p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            {imagem ? "Trocar" : "Escolher"}
          </Button>

          {imagem && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setImagem("")}
              className="text-texto-suave hover:text-destructive"
            >
              <X className="size-4" />
              Remover
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
