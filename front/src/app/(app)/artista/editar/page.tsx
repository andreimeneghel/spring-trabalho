import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditarArtistaForm } from "./editar-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { meuPerfilArtista } from "@/lib/api/artistas";

export const metadata: Metadata = { title: "Editar perfil de artista" };

export default async function EditarArtistaPage() {
  const perfil = await comGuarda(meuPerfilArtista).catch((erro) => {
    // sem perfil criado ainda: nao ha o que editar
    if (erro instanceof ApiError && erro.status === 404) notFound();
    throw erro;
  });

  return (
    <>
      <CabecalhoPagina titulo="Editar perfil de artista" />
      <EditarArtistaForm artista={perfil} />
    </>
  );
}
