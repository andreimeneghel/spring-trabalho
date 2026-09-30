import Link from "next/link";
import { Music2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatarDuracao } from "@/lib/utils/formato";
import type { MusicaResumo } from "@/types/api";

/** Linha do catálogo: leva ao detalhe da música. Server Component. */
export function MusicaItem({
  musica,
  mostrarArtista = true,
}: {
  musica: MusicaResumo;
  mostrarArtista?: boolean;
}) {
  return (
    <li className="transition-colors hover:bg-superficie-alta">
      <Link
        href={`/musicas/${musica.id}`}
        className="flex items-center gap-4 px-4 py-3"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-marca/10">
          <Music2
            className="size-5 text-marca dark:text-marca-clara"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{musica.titulo}</p>
          <p className="truncate text-sm text-texto-suave">
            {mostrarArtista && musica.artistaNome}
            {mostrarArtista && musica.albumTitulo && " · "}
            {musica.albumTitulo ?? (mostrarArtista ? "" : "Single")}
          </p>
        </div>

        {musica.categorias.length > 0 && (
          <div className="hidden shrink-0 gap-1 sm:flex">
            {musica.categorias.map((categoria) => (
              <Badge key={categoria.id} variant="secondary">
                {categoria.nome}
              </Badge>
            ))}
          </div>
        )}

        <span className="shrink-0 text-sm tabular-nums text-texto-suave">
          {formatarDuracao(musica.duracao)}
        </span>
      </Link>
    </li>
  );
}
