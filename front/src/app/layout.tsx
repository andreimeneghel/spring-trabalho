import type { Metadata } from "next";
import { TemaProvider } from "@/components/comum/tema-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SoundHub",
    template: "%s · SoundHub",
  },
  description:
    "Plataforma de streaming de música: monte playlists, descubra e avalie músicas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/*
        suppressHydrationWarning: extensoes de navegador (gerenciador de senhas,
        tradutor) injetam atributos no <body> antes do React carregar, e isso gera
        um aviso de hidratacao falso. A supressao vale só para este elemento.
      */}
      <body
        className="min-h-dvh bg-background text-foreground"
        suppressHydrationWarning
      >
        <TemaProvider>
          {children}
          <Toaster position="top-right" />
        </TemaProvider>
      </body>
    </html>
  );
}
