"use client";

import { atualizarArtistaAction } from "../actions";
import { ArtistaForm } from "@/components/artista/artista-form";
import type { ArtistaDetalhe } from "@/types/api";

export function EditarArtistaForm({ artista }: { artista: ArtistaDetalhe }) {
  // bind fixa o id como primeiro argumento da Server Action
  const action = atualizarArtistaAction.bind(null, artista.id);

  return (
    <ArtistaForm
      action={action}
      artista={artista}
      rotuloBotao="Salvar alterações"
    />
  );
}
