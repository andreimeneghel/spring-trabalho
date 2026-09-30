"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { formatarDuracao } from "@/lib/utils/formato";
import type { MusicaResumo } from "@/types/api";

export function AdicionarMusicaDialog({
  playlistId,
  catalogo,
  jaNaPlaylist,
}: {
  playlistId: number;
  catalogo: MusicaResumo[];
  jaNaPlaylist: number[];
}) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [pendente, startTransition] = useTransition();

  const disponiveis = useMemo(() => {
    const busca = termo.trim().toLowerCase();
    return catalogo
      .filter((m) => !jaNaPlaylist.includes(m.id))
      .filter(
        (m) =>
          !busca ||
          m.titulo.toLowerCase().includes(busca) ||
          m.artistaNome.toLowerCase().includes(busca),
      );
  }, [catalogo, jaNaPlaylist, termo]);

  function adicionar(musica: MusicaResumo) {
    startTransition(async () => {
      const resultado = await adicionarMusicaAction(playlistId, musica.id);
      if (resultado.ok) {
        toast.success(`"${musica.titulo}" adicionada`);
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Adicionar musica
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar música</DialogTitle>
          <DialogDescription>
            Escolha uma música do catálogo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-texto-fraco" />
            <Input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar por título ou artista"
              className="pl-9"
              aria-label="Buscar música"
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {disponiveis.length === 0 ? (
              <p className="py-8 text-center text-sm text-texto-suave">
                {termo
                  ? "Nenhuma música encontrada."
                  : "Todas as músicas do catálogo já estão nesta playlist."}
              </p>
            ) : (
              disponiveis.map((musica) => (
                <button
                  key={musica.id}
                  type="button"
                  disabled={pendente}
                  onClick={() => adicionar(musica)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-superficie-alta disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{musica.titulo}</p>
                    <p className="truncate text-xs text-texto-suave">
                      {musica.artistaNome}
                      {musica.albumTitulo && ` · ${musica.albumTitulo}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-texto-fraco">
                    {formatarDuracao(musica.duracao)}
                  </span>
                  <Plus className="size-4 shrink-0 text-marca dark:text-marca-clara" />
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
