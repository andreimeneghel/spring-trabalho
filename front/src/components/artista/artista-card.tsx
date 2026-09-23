import Link from "next/link";
import { Mic2 } from "lucide-react";

import type { ArtistaResumo } from "@/types/api";

export function ArtistaCard({ artista }: { artista: ArtistaResumo }) {
  return (
    <Link
      href={`/artistas/${artista.id}`}
      className="group flex flex-col items-center gap-3 rounded-lg p-3 text-center transition-colors hover:bg-superficie"
    >
      {/* circulo, como nos perfis de artista das plataformas de streaming */}
      <span className="relative aspect-square w-full overflow-hidden rounded-full transition-transform group-hover:scale-105">
        {artista.foto ? (
          // base64: o next/image nao otimiza data URI
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artista.foto} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-marca/25 to-marca/5">
            <Mic2
              className="size-8 text-marca dark:text-marca-clara"
              aria-hidden="true"
            />
          </span>
        )}
      </span>

      <span className="min-w-0 w-full">
        <span className="block truncate font-bold">{artista.nomeArtistico}</span>
        <span className="mt-0.5 block text-sm text-texto-suave">Artista</span>
      </span>
    </Link>
  );
}
