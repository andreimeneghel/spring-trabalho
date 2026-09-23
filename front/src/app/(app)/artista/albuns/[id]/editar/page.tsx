import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditarAlbumForm } from "./editar-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarAlbum } from "@/lib/api/artistas";

export const metadata: Metadata = { title: "Editar álbum" };

type Props = { params: Promise<{ id: string }> };

export default async function EditarAlbumPage({ params }: Props) {
  const { id } = await params;
  const albumId = Number(id);

  if (!Number.isInteger(albumId) || albumId < 1) notFound();

  const album = await comGuarda(() => buscarAlbum(albumId)).catch((erro) => {
    if (erro instanceof ApiError && erro.status === 404) notFound();
    throw erro;
  });

  return (
    <>
      <CabecalhoPagina titulo="Editar álbum" />
      <EditarAlbumForm album={album} />
    </>
  );
}
