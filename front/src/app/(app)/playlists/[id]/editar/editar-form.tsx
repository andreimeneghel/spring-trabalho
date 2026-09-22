"use client";

import { atualizarPlaylistAction } from "@/app/(app)/playlists/actions";
import { PlaylistForm } from "@/components/playlist/playlist-form";
import type { PlaylistDetalhe } from "@/types/api";

export function EditarForm({ playlist }: { playlist: PlaylistDetalhe }) {
  // bind fixa o id como primeiro argumento da Server Action
  const action = atualizarPlaylistAction.bind(null, playlist.id);

  return (
    <PlaylistForm
      action={action}
      playlist={playlist}
      rotuloBotao="Salvar alteracoes"
      cancelarHref={`/playlists/${playlist.id}`}
    />
  );
}
