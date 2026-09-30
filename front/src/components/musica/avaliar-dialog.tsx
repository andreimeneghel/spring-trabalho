"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  atualizarAvaliacaoAction,
  criarAvaliacaoAction,
} from "@/app/(app)/avaliacoes/actions";
import { EstrelasInput } from "@/components/avaliacao/estrelas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Avaliacao } from "@/types/api";

/**
 * Avalia a música, ou edita a avaliação que o usuário já tinha feito — a API
 * aceita uma avaliação por usuário por música (409 na segunda tentativa).
 */
export function AvaliarDialog({
  musicaId,
  titulo,
  minhaAvaliacao,
}: {
  musicaId: number;
  titulo: string;
  minhaAvaliacao?: Avaliacao;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [nota, setNota] = useState(minhaAvaliacao?.nota ?? 0);
  const [comentario, setComentario] = useState(minhaAvaliacao?.comentario ?? "");
  const [pendente, startTransition] = useTransition();

  function salvar() {
    startTransition(async () => {
      const resultado = minhaAvaliacao
        ? await atualizarAvaliacaoAction(minhaAvaliacao.id, nota, comentario)
        : await criarAvaliacaoAction(musicaId, nota, comentario);

      if (resultado.ok) {
        toast.success(minhaAvaliacao ? "Avaliação atualizada" : "Avaliação enviada");
        setAberto(false);
        router.refresh();   // a média e a lista da página são do servidor
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant={minhaAvaliacao ? "outline" : "secondary"}>
          <Star className="size-4" />
          {minhaAvaliacao ? "Editar minha nota" : "Avaliar"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{minhaAvaliacao ? "Editar avaliação" : "Avaliar música"}</DialogTitle>
          <DialogDescription>
            Sua nota de 1 a 5 para &ldquo;{titulo}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <EstrelasInput
            valorInicial={minhaAvaliacao?.nota ?? 0}
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

          <div className="flex gap-3">
            <Button onClick={salvar} disabled={pendente || nota === 0}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
