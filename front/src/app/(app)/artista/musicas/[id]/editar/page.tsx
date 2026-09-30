import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EditarMusicaForm } from "./editar-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { meuPerfilArtista } from "@/lib/api/artistas";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarMusica, listarCategorias } from "@/lib/api/musicas";
import type { ArtistaDetalhe } from "@/types/api";

export const metadata: Metadata = { title: "Editar música" };

type Props = { params: Promise<{ id: string }> };

export default async function EditarMusicaPage({ params }: Props) {
  const { id } = await params;
  const musicaId = Number(id);

  if (!Number.isInteger(musicaId) || musicaId < 1) notFound();

  let perfil: ArtistaDetalhe | null = null;
  try {
    perfil = await comGuarda(meuPerfilArtista);
  } catch (erro) {
    if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
  }
  if (!perfil) redirect("/artista");

  const [musica, categorias] = await Promise.all([
    comGuarda(() => buscarMusica(musicaId)).catch((erro) => {
      if (erro instanceof ApiError && erro.status === 404) notFound();
      throw erro;
    }),
    comGuarda(listarCategorias),
  ]);

  // só o artista dono edita: evita chegar ao 403 da API pelo formulário
  if (musica.artistaId !== perfil.id) notFound();

  return (
    <>
      <CabecalhoPagina titulo="Editar música" />
      <EditarMusicaForm
        musica={musica}
        albuns={perfil.albuns}
        categorias={categorias}
      />
    </>
  );
}
