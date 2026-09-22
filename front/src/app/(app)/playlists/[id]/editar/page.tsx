import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditarForm } from "./editar-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarPlaylist } from "@/lib/api/playlists";
import { usuarioLogado } from "@/lib/api/usuarios";

export const metadata: Metadata = { title: "Editar playlist" };

type Props = { params: Promise<{ id: string }> };

export default async function EditarPlaylistPage({ params }: Props) {
  const { id } = await params;
  const playlistId = Number(id);

  if (!Number.isInteger(playlistId) || playlistId < 1) notFound();

  const [playlist, usuario] = await Promise.all([
    comGuarda(() => buscarPlaylist(playlistId)).catch((erro) => {
      if (erro instanceof ApiError && erro.status === 404) notFound();
      throw erro;
    }),
    comGuarda(usuarioLogado),
  ]);

  // O backend também barra, mas não faz sentido abrir o formulario
  if (playlist.donoId !== usuario.id) notFound();

  return (
    <>
      <CabecalhoPagina titulo="Editar playlist" />
      <EditarForm playlist={playlist} />
    </>
  );
}
