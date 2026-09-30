"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import type { EstadoForm } from "@/app/(app)/artista/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AlbumResumo, Categoria, MusicaDetalhe } from "@/types/api";

const MAX_CATEGORIAS = 5;

function BotaoSalvar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

export function MusicaForm({
  action,
  albuns,
  categorias,
  musica,
  rotuloBotao = "Publicar música",
  cancelarHref = "/artista",
}: {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  albuns: AlbumResumo[];
  categorias: Categoria[];
  musica?: MusicaDetalhe;
  rotuloBotao?: string;
  cancelarHref?: string;
}) {
  const [estado, formAction] = useActionState<EstadoForm, FormData>(action, {});

  /*
    Categoria e escolha múltipla com limite de 5. Os ids selecionados viram
    inputs hidden: como no switch da playlist, botão do Radix não entra no
    FormData — aqui são botões comuns, então o hidden é obrigatório.
  */
  const [selecionadas, setSelecionadas] = useState<number[]>(
    musica?.categorias.map((c) => c.id) ?? [],
  );

  const minutosIniciais = musica ? Math.floor(musica.duracao / 60) : "";
  const segundosIniciais = musica ? musica.duracao % 60 : "";

  function alternar(id: number) {
    setSelecionadas((atuais) =>
      atuais.includes(id)
        ? atuais.filter((i) => i !== id)
        : atuais.length >= MAX_CATEGORIAS
          ? atuais
          : [...atuais, id],
    );
  }

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
          defaultValue={musica?.titulo}
          placeholder="Nome da música"
          maxLength={150}
          aria-invalid={Boolean(estado.campos?.titulo)}
        />
        {estado.campos?.titulo && (
          <p className="text-sm text-destructive">{estado.campos.titulo}</p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-bold">Duração</legend>

        <div className="flex items-end gap-2">
          <div className="space-y-2">
            <Label htmlFor="duracaoMin" className="text-xs text-texto-suave">
              Minutos
            </Label>
            <Input
              id="duracaoMin"
              name="duracaoMin"
              type="number"
              inputMode="numeric"
              defaultValue={minutosIniciais}
              placeholder="3"
              min={0}
              max={120}
              className="w-24"
              aria-invalid={Boolean(estado.campos?.duracao)}
            />
          </div>

          <span className="pb-2.5 text-texto-fraco">:</span>

          <div className="space-y-2">
            <Label htmlFor="duracaoSeg" className="text-xs text-texto-suave">
              Segundos
            </Label>
            <Input
              id="duracaoSeg"
              name="duracaoSeg"
              type="number"
              inputMode="numeric"
              defaultValue={segundosIniciais}
              placeholder="34"
              min={0}
              max={59}
              className="w-24"
              aria-invalid={Boolean(estado.campos?.duracao)}
            />
          </div>
        </div>

        {estado.campos?.duracao && (
          <p className="text-sm text-destructive">{estado.campos.duracao}</p>
        )}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="albumId">
          Álbum <span className="text-texto-fraco">(opcional)</span>
        </Label>
        {/*
          select nativo de propósito: o Select do Radix renderiza <button> e não
          entra no FormData — o mesmo problema que o switch da playlist já causou.
        */}
        <select
          id="albumId"
          name="albumId"
          defaultValue={musica?.albumId ? String(musica.albumId) : ""}
          aria-invalid={Boolean(estado.campos?.albumId)}
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-3.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
        >
          <option value="">Sem álbum (single)</option>
          {albuns.map((album) => (
            <option key={album.id} value={album.id}>
              {album.titulo}
              {album.anoLancamento ? ` (${album.anoLancamento})` : ""}
            </option>
          ))}
        </select>
        {albuns.length === 0 && (
          <p className="text-sm text-texto-suave">
            Você ainda não tem álbuns — a música fica como single.
          </p>
        )}
        {estado.campos?.albumId && (
          <p className="text-sm text-destructive">{estado.campos.albumId}</p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-bold">
          Categorias{" "}
          <span className="font-normal text-texto-fraco">
            (até {MAX_CATEGORIAS}, opcional)
          </span>
        </legend>

        {selecionadas.map((id) => (
          <input key={id} type="hidden" name="categoriaIds" value={id} />
        ))}

        <div className="flex flex-wrap gap-2">
          {categorias.map((categoria) => {
            const ativa = selecionadas.includes(categoria.id);
            const cheio = !ativa && selecionadas.length >= MAX_CATEGORIAS;
            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() => alternar(categoria.id)}
                aria-pressed={ativa}
                disabled={cheio}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors",
                  ativa
                    ? "border-marca bg-marca/15 font-bold text-marca dark:text-marca-clara"
                    : "border-border text-texto-suave hover:border-texto-fraco",
                  cheio && "cursor-not-allowed opacity-40",
                )}
              >
                {categoria.nome}
              </button>
            );
          })}
        </div>

        {estado.campos?.categoriaIds && (
          <p className="text-sm text-destructive">{estado.campos.categoriaIds}</p>
        )}
      </fieldset>

      <div className="flex gap-3">
        <BotaoSalvar rotulo={rotuloBotao} />
        <Button variant="ghost" asChild>
          <Link href={cancelarHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
