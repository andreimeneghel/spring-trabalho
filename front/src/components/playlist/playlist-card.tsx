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
      className="group flex flex-col gap-3 rounded-lg border border-border bg-superficie p-4 transition-colors hover:border-texto-fraco hover:bg-superficie-alta"
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-marca/15">
        <Music2 className="size-5 text-marca dark:text-marca-clara" aria-hidden="true" />
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="flex items-center gap-1.5 truncate font-bold">
          <span className="truncate">{playlist.nome}</span>
          {!playlist.publica && (
            <Lock
              className="size-3 shrink-0 text-texto-fraco"
              aria-label="Privada"
            />
          )}
        </h3>

        {playlist.descricao && (
          <p className="line-clamp-2 text-sm leading-snug text-texto-suave">
            {playlist.descricao}
          </p>
        )}
      </div>

      <p className="mt-auto text-xs text-texto-fraco">
        {contarMusicas(playlist.totalMusicas)}
        {mostrarDono && ` · ${playlist.donoNome}`}
      </p>
    </Link>
  );
}
