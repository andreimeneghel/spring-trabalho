"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Headphones, Mic2 } from "lucide-react";

import { registrarAction, type EstadoFormulario } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TipoUsuario } from "@/types/api";

const TIPOS = [
  {
    valor: "OUVINTE" as const,
    titulo: "Ouvinte",
    descricao: "Monta playlists e avalia músicas",
    Icone: Headphones,
  },
  {
    valor: "ARTISTA" as const,
    titulo: "Artista",
    descricao: "Pública albuns e músicas",
    Icone: Mic2,
  },
];

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}

export function RegistroForm() {
  const [tipo, setTipo] = useState<TipoUsuario>("OUVINTE");
  const [estado, formAction] = useActionState<EstadoFormulario, FormData>(
    registrarAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
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
          autoComplete="name"
          placeholder="Seu nome"
          aria-invalid={Boolean(estado.campos?.nome)}
        />
        {estado.campos?.nome && (
          <p className="text-sm text-destructive">{estado.campos.nome}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="você@email.com"
          aria-invalid={Boolean(estado.campos?.email)}
        />
        {estado.campos?.email && (
          <p className="text-sm text-destructive">{estado.campos.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
          aria-invalid={Boolean(estado.campos?.senha)}
        />
        {estado.campos?.senha && (
          <p className="text-sm text-destructive">{estado.campos.senha}</p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-bold">Tipo de conta</legend>
        <input type="hidden" name="tipo" value={tipo} />

        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map(({ valor, titulo, descricao, Icone }) => {
            const ativo = tipo === valor;
            return (
              <button
                key={valor}
                type="button"
                onClick={() => setTipo(valor)}
                aria-pressed={ativo}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-left transition-colors",
                  ativo
                    ? "border-marca bg-marca/10"
                    : "border-border bg-superficie hover:border-texto-fraco",
                )}
              >
                <Icone
                  className={cn(
                    "mb-2 size-5",
                    ativo ? "text-marca dark:text-marca-clara" : "text-texto-suave",
                  )}
                />
                <span className="block text-sm font-bold">{titulo}</span>
                <span className="mt-0.5 block text-xs leading-snug text-texto-suave">
                  {descricao}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <BotaoCriar />
    </form>
  );
}
