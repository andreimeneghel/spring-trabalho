import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-sm text-texto-suave">
          Use sua conta para acessar suas playlists.
        </p>
      </header>

      {/* useSearchParams exige Suspense no App Router */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>

      <p className="text-sm text-texto-suave">
        Não tem conta?{" "}
        <Link
          href="/registrar"
          className="font-bold text-marca dark:text-marca-clara underline-offset-4 hover:underline"
        >
          Criar agora
        </Link>
      </p>
    </div>
  );
}
