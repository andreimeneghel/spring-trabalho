"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ListMusic, Lock, Plus } from "lucide-react";
import { toast } from "sonner";

import { adicionarMusicaAction } from "@/app/(app)/playlists/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { contarMusicas } from "@/lib/utils/formato";
import type { PlaylistResumo } from "@/types/api";

/**
 * Caminho inverso do diálogo da playlist: aqui a música já está escolhida e o
 * usuário escolhe em qual das suas playlists ela entra.
 */
export function AdicionarAPlaylistDialog({
  musicaId,
  titulo,
  playlists,
}: {
  musicaId: number;
  titulo: string;
  playlists: PlaylistResumo[];
}) {
  const [aberto, setAberto] = useState(false);
  const [pendente, startTransition] = useTransition();

  function adicionar(playlist: PlaylistResumo) {
    startTransition(async () => {
      const resultado = await adicionarMusicaAction(playlist.id, musicaId);
      if (resultado.ok) {
        toast.success(`"${titulo}" adicionada em ${playlist.nome}`);
        setAberto(false);
      } else {
        // 409 quando a música já está na playlist
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Adicionar a playlist
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar a uma playlist</DialogTitle>
          <DialogDescription>
            &ldquo;{titulo}&rdquo; entra no fim da playlist escolhida.
          </DialogDescription>
        </DialogHeader>

        {playlists.length === 0 ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-texto-suave">
              Você ainda não tem playlists.
            </p>
            <Button asChild size="sm">
              <Link href="/playlists/nova">Criar playlist</Link>
            </Button>
          </div>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                disabled={pendente}
                onClick={() => adicionar(playlist)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-superficie-alta disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ListMusic
                  className="size-4 shrink-0 text-marca dark:text-marca-clara"
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{playlist.nome}</p>
                  <p className="truncate text-xs text-texto-suave">
                    {contarMusicas(playlist.totalMusicas)}
                  </p>
                </div>

                {!playlist.publica && (
                  <Lock className="size-3.5 shrink-0 text-texto-fraco" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
