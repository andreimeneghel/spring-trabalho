"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import type { EstadoForm } from "@/app/(app)/artista/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AlbumDetalhe } from "@/types/api";

function BotaoSalvar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

export function AlbumForm({
  action,
  album,
  rotuloBotao = "Criar álbum",
  cancelarHref = "/artista",
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  album?: AlbumDetalhe;
  rotuloBotao?: string;
  cancelarHref?: string;
}) {
  const [estado, formAction] = useActionState<EstadoForm, FormData>(action, {});
  const anoAtual = new Date().getFullYear();

  return (
    <form action={formAction} className="max-w-lg space-y-6" noValidate>
      {estado.erro && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {estado.erro}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={album?.titulo}
          placeholder="Nome do álbum"
          maxLength={150}
          aria-invalid={Boolean(estado.campos?.titulo)}
        />
        {estado.campos?.titulo && (
          <p className="text-sm text-destructive">{estado.campos.titulo}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="anoLancamento">
          Ano de lançamento <span className="text-texto-fraco">(opcional)</span>
        </Label>
        <Input
          id="anoLancamento"
          name="anoLancamento"
          type="number"
          inputMode="numeric"
          defaultValue={album?.anoLancamento ?? ""}
          placeholder={String(anoAtual)}
          min={1900}
          max={anoAtual}
          className="max-w-40"
          aria-invalid={Boolean(estado.campos?.anoLancamento)}
        />
        {estado.campos?.anoLancamento && (
          <p className="text-sm text-destructive">{estado.campos.anoLancamento}</p>
        )}
      </div>

      <div className="flex gap-3">
        <BotaoSalvar rotulo={rotuloBotao} />
        <Button variant="ghost" asChild>
          <Link href={cancelarHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
