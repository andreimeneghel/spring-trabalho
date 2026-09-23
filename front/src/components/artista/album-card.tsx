"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Disc3, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { excluirAlbumAction } from "@/app/(app)/artista/actions";
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
import { Button } from "@/components/ui/button";
import type { AlbumResumo } from "@/types/api";

export function AlbumCard({ album }: { album: AlbumResumo }) {
  const [pendente, startTransition] = useTransition();

  function excluir() {
    startTransition(async () => {
      const resultado = await excluirAlbumAction(album.id);
      if (resultado.ok) {
        toast.success(`"${album.titulo}" excluído`);
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <article className="flex items-center gap-3 rounded-lg border border-border bg-superficie p-3">
      <span className="relative size-12 shrink-0 overflow-hidden rounded-md">
        {album.capa ? (
          // base64: o next/image nao otimiza data URI
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.capa} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center bg-marca/10">
            <Disc3
              className="size-5 text-marca dark:text-marca-clara"
              aria-hidden="true"
            />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold">{album.titulo}</h3>
        <p className="text-sm text-texto-suave">
          {album.anoLancamento ?? "Ano não informado"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          asChild
          aria-label={`Editar ${album.titulo}`}
        >
          <Link href={`/artista/albuns/${album.id}/editar`}>
            <Pencil className="size-4" />
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={pendente}
              aria-label={`Excluir ${album.titulo}`}
              className="text-texto-fraco hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Excluir &ldquo;{album.titulo}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                As músicas do álbum não são apagadas — elas ficam sem álbum.
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
    </article>
  );
}
