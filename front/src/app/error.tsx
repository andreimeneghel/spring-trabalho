"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <AlertTriangle className="size-8 text-texto-fraco" aria-hidden="true" />

      <div className="space-y-2">
        <h1 className="text-xl font-bold">Algo deu errado</h1>
        <p className="max-w-sm text-sm text-texto-suave">
          Não foi possível carregar esta página. Verifique se a API esta no ar e
          tente de novo.
        </p>
      </div>

      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
