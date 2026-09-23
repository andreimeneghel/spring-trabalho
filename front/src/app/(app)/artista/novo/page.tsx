import type { Metadata } from "next";

import { criarArtistaAction } from "../actions";
import { ArtistaForm } from "@/components/artista/artista-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";

export const metadata: Metadata = { title: "Criar perfil de artista" };

export default function NovoArtistaPage() {
  return (
    <>
      <CabecalhoPagina
        titulo="Criar perfil de artista"
        descricao="É assim que você aparece para quem ouve suas músicas."
      />
      <ArtistaForm action={criarArtistaAction} />
    </>
  );
}
