import Link from "next/link";
import { Disc3 } from "lucide-react";

import type { AlbumResumo } from "@/types/api";

/** Card de album nas listagens publicas — leva ao perfil do artista. */
export function AlbumPublicoCard({ album }: { album: AlbumResumo }) {
  return (
    <Link
      href={`/artistas/${album.artistaId}`}
      className="group flex flex-col gap-3 rounded-lg p-2 transition-colors hover:bg-superficie"
    >
      <span className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105">
        {album.capa ? (
          // base64: o next/image nao otimiza data URI
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.capa} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-marca/25 to-marca/5">
            <Disc3
              className="size-10 text-marca dark:text-marca-clara"
              aria-hidden="true"
            />
          </span>
        )}
      </span>

      <span className="min-w-0 px-0.5">
        <span className="block truncate font-bold">{album.titulo}</span>
        <span className="mt-0.5 block truncate text-sm text-texto-suave">
          {album.artistaNome}
          {album.anoLancamento && ` · ${album.anoLancamento}`}
        </span>
      </span>
    </Link>
  );
}
