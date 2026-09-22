"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  alterarSenhaAction,
  atualizarPerfilAction,
  type EstadoPerfil,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Usuario } from "@/types/api";

function BotaoSalvar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

function Alerta({ mensagem }: { mensagem: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {mensagem}
    </p>
  );
}

export function DadosForm({ usuario }: { usuario: Usuario }) {
  const action = atualizarPerfilAction.bind(null, usuario.id);
  const [estado, formAction] = useActionState<EstadoPerfil, FormData>(action, {});

  useEffect(() => {
    if (estado.ok) toast.success("Dados atualizados");
  }, [estado.ok]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {estado.erro && <Alerta mensagem={estado.erro} />}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={usuario.nome}
          maxLength={100}
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
          defaultValue={usuario.email}
          maxLength={150}
          aria-invalid={Boolean(estado.campos?.email)}
        />
        {estado.campos?.email && (
          <p className="text-sm text-destructive">{estado.campos.email}</p>
        )}
      </div>

      <BotaoSalvar rotulo="Salvar dados" />
    </form>
  );
}

export function SenhaForm({ usuarioId }: { usuarioId: number }) {
  const action = alterarSenhaAction.bind(null, usuarioId);
  const [estado, formAction] = useActionState<EstadoPerfil, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) {
      toast.success("Senha alterada");
      formRef.current?.reset();
    }
  }, [estado.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {estado.erro && <Alerta mensagem={estado.erro} />}

      <div className="space-y-2">
        <Label htmlFor="senhaAtual">Senha atual</Label>
        <Input
          id="senhaAtual"
          name="senhaAtual"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(estado.campos?.senhaAtual)}
        />
        {estado.campos?.senhaAtual && (
          <p className="text-sm text-destructive">{estado.campos.senhaAtual}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="novaSenha">Nova senha</Label>
        <Input
          id="novaSenha"
          name="novaSenha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
          aria-invalid={Boolean(estado.campos?.novaSenha)}
        />
        {estado.campos?.novaSenha && (
          <p className="text-sm text-destructive">{estado.campos.novaSenha}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmar">Confirmar nova senha</Label>
        <Input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(estado.campos?.confirmar)}
        />
        {estado.campos?.confirmar && (
          <p className="text-sm text-destructive">{estado.campos.confirmar}</p>
        )}
      </div>

      <BotaoSalvar rotulo="Alterar senha" />
    </form>
  );
}
