"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { removerMusicaAction } from "@/app/(app)/playlists/actions";
import { Button } from "@/components/ui/button";
import { formatarDuracao } from "@/lib/utils/formato";
import type { MusicaDaPlaylist } from "@/types/api";

export function ListaMusicas({
  playlistId,
  musicas,
  podeEditar,
}: {
  playlistId: number;
  musicas: MusicaDaPlaylist[];
  podeEditar: boolean;
}) {
  const [pendente, startTransition] = useTransition();

  function remover(musicaId: number, titulo: string) {
    startTransition(async () => {
      const resultado = await removerMusicaAction(playlistId, musicaId);
      if (resultado.ok) {
        toast.success(`"${titulo}" removida da playlist`);
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-superficie">
      {musicas.map((musica) => (
        <li
          key={musica.musicaId}
          className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-superficie-alta"
        >
          <span className="w-5 shrink-0 text-right text-sm tabular-nums text-texto-fraco">
            {musica.ordem + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{musica.titulo}</p>
            {musica.artista && (
              <p className="truncate text-sm text-texto-suave">{musica.artista}</p>
            )}
          </div>

          <span className="shrink-0 text-sm tabular-nums text-texto-suave">
            {formatarDuracao(musica.duracao)}
          </span>

          {podeEditar && (
            <Button
              variant="ghost"
              size="icon"
              disabled={pendente}
              onClick={() => remover(musica.musicaId, musica.titulo)}
              aria-label={`Remover ${musica.titulo} da playlist`}
              className="shrink-0 text-texto-fraco hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </li>
      ))}
    </ol>
  );
}
