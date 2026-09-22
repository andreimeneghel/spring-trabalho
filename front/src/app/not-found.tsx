import Link from "next/link";

import { LogoComNome } from "@/components/comum/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoComNome altura={72} />

      <div className="space-y-2">
        <p className="text-5xl font-bold tabular-nums text-texto-fraco">404</p>
        <h1 className="text-xl font-bold">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-texto-suave">
          O endereço nao existe, ou o conteúdo foi removido.
        </p>
      </div>

      <Button asChild>
        <Link href="/playlists">Voltar para as playlists</Link>
      </Button>
    </div>
  );
}
