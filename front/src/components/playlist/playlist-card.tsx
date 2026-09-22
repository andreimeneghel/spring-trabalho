import Link from "next/link";
import { Lock, Music2 } from "lucide-react";

import { contarMusicas } from "@/lib/utils/formato";
import type { PlaylistResumo } from "@/types/api";

export function PlaylistCard({
  playlist,
  mostrarDono = false,
}: {
  playlist: PlaylistResumo;
  mostrarDono?: boolean;
}) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col gap-3 rounded-lg p-2 transition-colors hover:bg-superficie"
    >
      {/* Capa quadrada com o nome sobreposto numa faixa */}
      <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-superficie-alta shadow-md">
        {playlist.capa ? (
          // base64: o next/image nao otimiza data URI, entao <img> comum
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={playlist.capa}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-marca/25 to-marca/5">
            <Music2
              className="size-10 text-marca dark:text-marca-clara"
              aria-hidden="true"
            />
          </span>
        )}

        {/* Escurece a base da capa para a faixa do nome ter contraste */}
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        <span className="absolute inset-x-0 bottom-3 flex items-stretch gap-2">
          {/* barrinha */}
          <span aria-hidden="true" className="w-3 shrink-0 bg-black/80" />

          {/* bloco com o nome, ocupando o resto da largura */}
          <span className="flex min-w-0 flex-1 items-center gap-1.5 bg-gradient-to-r from-black/80 to-black/30 px-3 py-2.5 ">
            <span className="truncate text-base font-bold text-white">
              {playlist.nome}
            </span>
            {!playlist.publica && (
              <Lock
                className="size-3.5 shrink-0 text-white/80"
                aria-label="Privada"
              />
            )}
          </span>
        </span>
      </span>

      {/* Metadados abaixo da capa */}
      <span className="min-w-0 px-0.5">
        <span className="line-clamp-2 text-sm leading-snug text-texto-suave">
          {playlist.descricao?.trim() ||
            (mostrarDono
              ? `Playlist de ${playlist.donoNome}`
              : contarMusicas(playlist.totalMusicas))}
        </span>

        {playlist.descricao?.trim() && (
          <span className="mt-0.5 block text-xs text-texto-fraco">
            {contarMusicas(playlist.totalMusicas)}
            {mostrarDono && ` · ${playlist.donoNome}`}
          </span>
        )}
      </span>
    </Link>
  );
}
