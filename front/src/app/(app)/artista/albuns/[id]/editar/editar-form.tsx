"use client";

import { atualizarAlbumAction } from "@/app/(app)/artista/actions";
import { AlbumForm } from "@/components/artista/album-form";
import type { AlbumDetalhe } from "@/types/api";

export function EditarAlbumForm({ album }: { album: AlbumDetalhe }) {
  // bind fixa o id como primeiro argumento da Server Action
  const action = atualizarAlbumAction.bind(null, album.id);

  return (
    <AlbumForm action={action} album={album} rotuloBotao="Salvar alterações" />
  );
}
