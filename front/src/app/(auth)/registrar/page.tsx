import type { Metadata } from "next";
import Link from "next/link";

import { RegistroForm } from "./registro-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegistrarPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-texto-suave">
          Leva menos de um minuto.
        </p>
      </header>

      <RegistroForm />

      <p className="text-sm text-texto-suave">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-bold text-marca dark:text-marca-clara underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
