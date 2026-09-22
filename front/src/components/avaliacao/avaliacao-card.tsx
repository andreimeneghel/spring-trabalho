"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  atualizarAvaliacaoAction,
  excluirAvaliacaoAction,
} from "@/app/(app)/avaliacoes/actions";
import { EstrelasInput, EstrelasLeitura } from "./estrelas";
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
import { Textarea } from "@/components/ui/textarea";
import { formatarData } from "@/lib/utils/formato";
import type { Avaliacao } from "@/types/api";

export function AvaliacaoCard({ avaliacao }: { avaliacao: Avaliacao }) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState(avaliacao.nota);
  const [comentario, setComentario] = useState(avaliacao.comentario ?? "");
  const [pendente, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      const resultado = await atualizarAvaliacaoAction(avaliacao.id, nota, comentario);
      if (resultado.ok) {
        toast.success("Avaliação atualizada");
        setEditando(false);
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  function excluir() {
    startTransition(async () => {
      const resultado = await excluirAvaliacaoAction(avaliacao.id);
      if (resultado.ok) {
        toast.success("Avaliação excluida");
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  function cancelar() {
    setNota(avaliacao.nota);
    setComentario(avaliacao.comentario ?? "");
    setEditando(false);
  }

  return (
    <article className="rounded-lg border border-border bg-superficie p-4">
      <header className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate font-bold">{avaliacao.musicaTitulo}</h3>
          <p className="text-xs text-texto-fraco">
            {avaliacao.atualizadaEm
              ? `Editada em ${formatarData(avaliacao.atualizadaEm)}`
              : formatarData(avaliacao.criadaEm)}
          </p>
        </div>

        {!editando && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditando(true)}
              aria-label={`Editar avaliação de ${avaliacao.musicaTitulo}`}
            >
              <Pencil className="size-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir avaliação de ${avaliacao.musicaTitulo}`}
                  className="text-texto-fraco hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sua nota e seu comentario sobre &ldquo;{avaliacao.musicaTitulo}&rdquo;
                    serão removidos.
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
        )}
      </header>

      {editando ? (
        <div className="space-y-3">
          <EstrelasInput
            nome={`nota-${avaliacao.id}`}
            valorInicial={nota}
            aoMudar={setNota}
          />
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentário (opcional)"
            maxLength={500}
            rows={3}
            aria-label="Comentário"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={salvar} disabled={pendente}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelar} disabled={pendente}>
              <X className="size-4" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <EstrelasLeitura nota={avaliacao.nota} />
          {avaliacao.comentario && (
            <p className="text-sm leading-relaxed text-texto-suave">
              {avaliacao.comentario}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
