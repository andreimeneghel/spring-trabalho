"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Mic2 } from "lucide-react";

import type { EstadoForm } from "@/app/(app)/artista/actions";
import { SeletorImagem } from "@/components/comum/seletor-imagem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ArtistaDetalhe } from "@/types/api";

function BotaoSalvar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

export function ArtistaForm({
  action,
  artista,
  rotuloBotao = "Criar perfil",
  cancelarHref = "/artista",
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  artista?: ArtistaDetalhe;
  rotuloBotao?: string;
  cancelarHref?: string;
}) {
  const [estado, formAction] = useActionState<EstadoForm, FormData>(action, {});

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

      <SeletorImagem
        name="foto"
        valorInicial={artista?.foto}
        rotulo="Foto do artista"
        Icone={Mic2}
        formato="circulo"
      />

      <div className="space-y-2">
        <Label htmlFor="nomeArtistico">Nome artístico</Label>
        <Input
          id="nomeArtistico"
          name="nomeArtistico"
          defaultValue={artista?.nomeArtistico}
          placeholder="Como você aparece para o público"
          maxLength={100}
          aria-invalid={Boolean(estado.campos?.nomeArtistico)}
        />
        {estado.campos?.nomeArtistico && (
          <p className="text-sm text-destructive">{estado.campos.nomeArtistico}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="biografia">
          Biografia <span className="text-texto-fraco">(opcional)</span>
        </Label>
        <Textarea
          id="biografia"
          name="biografia"
          defaultValue={artista?.biografia ?? ""}
          placeholder="Conte um pouco sobre o seu trabalho"
          maxLength={1000}
          rows={5}
          aria-invalid={Boolean(estado.campos?.biografia)}
        />
        {estado.campos?.biografia && (
          <p className="text-sm text-destructive">{estado.campos.biografia}</p>
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
