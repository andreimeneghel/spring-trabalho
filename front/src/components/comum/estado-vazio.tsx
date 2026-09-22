import type { LucideIcon } from "lucide-react";

/** Lista vazia nunca fica só com texto: sempre oferece o próximo passo. */
export function EstadoVazio({
  Icone,
  titulo,
  descricao,
  acao,
}: {
  Icone: LucideIcon;
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-superficie/50 p-8">
      <Icone className="size-6 text-texto-fraco" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-bold">{titulo}</p>
        <p className="max-w-md text-sm leading-relaxed text-texto-suave">
          {descricao}
        </p>
      </div>
      {acao}
    </div>
  );
}
