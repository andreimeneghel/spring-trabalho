"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import type { EstadoPlaylist } from "@/app/(app)/playlists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PlaylistDetalhe } from "@/types/api";

function BotaoSalvar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

export function PlaylistForm({
  action,
  playlist,
  rotuloBotao = "Criar playlist",
  cancelarHref = "/playlists",
}: {
  action: (estado: EstadoPlaylist, formData: FormData) => Promise<EstadoPlaylist>;
  playlist?: PlaylistDetalhe;
  rotuloBotao?: string;
  cancelarHref?: string;
}) {
  const [estado, formAction] = useActionState<EstadoPlaylist, FormData>(action, {});
  const [publica, setPublica] = useState(playlist?.publica ?? true);

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
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={playlist?.nome}
          placeholder="Ex.: Para estudar"
          maxLength={100}
          aria-invalid={Boolean(estado.campos?.nome)}
        />
        {estado.campos?.nome && (
          <p className="text-sm text-destructive">{estado.campos.nome}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">
          Descricao <span className="text-texto-fraco">(opcional)</span>
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={playlist?.descricao ?? ""}
          placeholder="Do que se trata esta playlist?"
          maxLength={300}
          rows={3}
          aria-invalid={Boolean(estado.campos?.descricao)}
        />
        {estado.campos?.descricao && (
          <p className="text-sm text-destructive">{estado.campos.descricao}</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-superficie p-4">
        <div className="space-y-0.5">
          <Label htmlFor="publica" className="cursor-pointer">
            Playlist publica
          </Label>
          <p className="text-sm text-texto-suave">
            {publica
              ? "Qualquer pessoa pode ver esta playlist."
              : "Só você consegue ver esta playlist."}
          </p>
        </div>

        {/*
          O Switch do Radix e um <button>, entao nao entra sozinho no FormData.
          O input hidden ao lado e quem carrega o valor no submit.
        */}
        <input type="hidden" name="publica" value={publica ? "on" : "off"} />
        <Switch id="publica" checked={publica} onCheckedChange={setPublica} />
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
