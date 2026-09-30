"use client";

import { atualizarMusicaAction } from "@/app/(app)/artista/actions";
import { MusicaForm } from "@/components/musica/musica-form";
import type { AlbumResumo, Categoria, MusicaDetalhe } from "@/types/api";

export function EditarMusicaForm({
  musica,
  albuns,
  categorias,
}: {
  musica: MusicaDetalhe;
  albuns: AlbumResumo[];
  categorias: Categoria[];
}) {
  // bind fixa o id como primeiro argumento da Server Action
  const action = atualizarMusicaAction.bind(null, musica.id);

  return (
    <MusicaForm
      action={action}
      albuns={albuns}
      categorias={categorias}
      musica={musica}
      rotuloBotao="Salvar alterações"
    />
  );
}
