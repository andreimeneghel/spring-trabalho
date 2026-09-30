"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Disc3, Music2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { excluirMusicaAction } from "@/app/(app)/artista/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarDuracao } from "@/lib/utils/formato";
import type { MusicaResumo } from "@/types/api";

/** Linha da música na área do artista: editar e excluir. */
export function MusicaCard({ musica }: { musica: MusicaResumo }) {
  const [pendente, startTransition] = useTransition();

  function excluir() {
    startTransition(async () => {
      const resultado = await excluirMusicaAction(musica.id);
      if (resultado.ok) {
        toast.success(`"${musica.titulo}" excluída`);
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <li className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-superficie-alta">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-marca/10">
        <Music2
          className="size-5 text-marca dark:text-marca-clara"
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <Link
          href={`/musicas/${musica.id}`}
          className="truncate font-bold hover:underline"
        >
          {musica.titulo}
        </Link>

        <p className="flex items-center gap-1.5 truncate text-sm text-texto-suave">
          {musica.albumTitulo ? (
            <>
              <Disc3 className="size-3.5 shrink-0" aria-hidden="true" />
              {musica.albumTitulo}
            </>
          ) : (
            "Single"
          )}
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

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label={`Editar ${musica.titulo}`}
        >
          <Link href={`/artista/musicas/${musica.id}/editar`}>
            <Pencil className="size-4" />
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={pendente}
              aria-label={`Excluir ${musica.titulo}`}
              className="text-texto-fraco hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Excluir &ldquo;{musica.titulo}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                A música sai das playlists em que estiver e as avaliações que ela
                recebeu são apagadas. Não dá para desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={excluir}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
