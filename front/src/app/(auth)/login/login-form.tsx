"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { loginAction, type EstadoFormulario } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function BotaoEntrar({ bloqueado }: { bloqueado: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="h-11 w-full text-base"
      disabled={pending || bloqueado}
    >
      {pending ? "Entrando..." : bloqueado ? "Aguarde..." : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const destino = params.get("redirect") ?? "";
  const expirado = params.get("expirado") === "1";

  const [estado, formAction] = useActionState<EstadoFormulario, FormData>(
    loginAction,
    {},
  );
  /*
    Guardamos o instante em que o bloqueio acaba e derivamos os segundos a cada
    tique. Assim o efeito nunca chama setState direto no corpo — o React 19
    acusa isso como erro — e a contagem nao atrasa se a aba ficar em segundo
    plano, porque e sempre recalculada a partir do relogio.
  */
  const [agora, setAgora] = useState(() => Date.now());
  const fimDoBloqueio =
    estado.segundosRestantes && estado.recebidoEm
      ? estado.recebidoEm + estado.segundosRestantes * 1000
      : 0;
  const segundosRestantes = fimDoBloqueio
    ? Math.max(0, Math.ceil((fimDoBloqueio - agora) / 1000))
    : 0;

  useEffect(() => {
    if (!fimDoBloqueio) return;

    const intervalo = window.setInterval(() => setAgora(Date.now()), 500);
    return () => window.clearInterval(intervalo);
  }, [fimDoBloqueio]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="redirect" value={destino} />

      {expirado && !estado.erro && (
        <p className="rounded-md border border-border bg-superficie px-3 py-2 text-sm text-texto-suave">
          Sua sessão expirou. Entre novamente.
        </p>
      )}

      {estado.erro && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {estado.erro}
        </p>
      )}

      {segundosRestantes > 0 && (
        <p
          role="status"
          className="rounded-md border border-border bg-superficie px-3 py-2 text-sm text-texto-suave"
        >
          Aguarde {segundosRestantes}s para tentar novamente.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="você@email.com"
          aria-invalid={Boolean(estado.campos?.email)}
          aria-describedby={estado.campos?.email ? "erro-email" : undefined}
        />
        {estado.campos?.email && (
          <p id="erro-email" className="text-sm text-destructive">
            {estado.campos.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(estado.campos?.senha)}
          aria-describedby={estado.campos?.senha ? "erro-senha" : undefined}
        />
        {estado.campos?.senha && (
          <p id="erro-senha" className="text-sm text-destructive">
            {estado.campos.senha}
          </p>
        )}
      </div>

      <BotaoEntrar bloqueado={segundosRestantes > 0} />
    </form>
  );
}
