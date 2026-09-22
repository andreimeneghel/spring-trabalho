import type { Metadata } from "next";

import { criarPlaylistAction } from "../actions";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { PlaylistForm } from "@/components/playlist/playlist-form";

export const metadata: Metadata = { title: "Nova playlist" };

export default function NovaPlaylistPage() {
  return (
    <>
      <CabecalhoPagina
        titulo="Nova playlist"
        descricao="Depois de criar, você adiciona as músicas."
      />
      <PlaylistForm action={criarPlaylistAction} />
    </>
  );
}
