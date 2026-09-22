import type { Metadata } from "next";
import { Headphones, Mic2 } from "lucide-react";

import { FotoPerfil } from "./foto-perfil";
import { DadosForm, SenhaForm } from "./perfil-forms";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { comGuarda } from "@/lib/api/guard";
import { usuarioLogado } from "@/lib/api/usuarios";

export const metadata: Metadata = { title: "Perfil" };

/** Cartão com titulo, usado nas três seções da página. */
function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-superficie p-6">
      <header className="mb-5">
        <h2 className="font-bold">{titulo}</h2>
        {descricao && (
          <p className="mt-0.5 text-sm text-texto-suave">{descricao}</p>
        )}
      </header>
      {children}
    </section>
  );
}

export default async function PerfilPage() {
  const usuario = await comGuarda(usuarioLogado);
  const ehArtista = usuario.tipo === "ARTISTA";

  return (
    <>
      <CabecalhoPagina
        titulo="Perfil"
        descricao="Seus dados de conta e foto."
      />

      <div className="max-w-xl space-y-4">
        <Secao titulo="Foto">
          <FotoPerfil usuario={usuario} />
        </Secao>

        <Secao
          titulo="Dados da conta"
          descricao="Como você aparece para os outros usuários."
        >
          <div className="mb-5 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              {ehArtista ? (
                <Mic2 className="size-3" />
              ) : (
                <Headphones className="size-3" />
              )}
              {ehArtista ? "Artista" : "Ouvinte"}
            </Badge>
            <span className="text-xs text-texto-fraco">
              O tipo de conta e definido no cadastro e nao pode ser alterado
            </span>
          </div>

          <DadosForm usuario={usuario} />
        </Secao>

        <Secao
          titulo="Senha"
          descricao="Use uma senha que você não usa em outro lugar."
        >
          <SenhaForm usuarioId={usuario.id} />
        </Secao>
      </div>
    </>
  );
}
