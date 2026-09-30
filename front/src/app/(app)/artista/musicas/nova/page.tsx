import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { criarMusicaAction } from "../../actions";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { MusicaForm } from "@/components/musica/musica-form";
import { meuPerfilArtista } from "@/lib/api/artistas";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { listarCategorias } from "@/lib/api/musicas";
import type { ArtistaDetalhe } from "@/types/api";

export const metadata: Metadata = { title: "Nova música" };

export default async function NovaMusicaPage() {
  /*
    Sem perfil de artista a API recusa o cadastro (400). Em vez de deixar o
    formulário falhar no envio, manda para a área do artista, que já mostra a
    tela de criar o perfil.
  */
  let perfil: ArtistaDetalhe | null = null;
  try {
    perfil = await comGuarda(meuPerfilArtista);
  } catch (erro) {
    if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
  }
  if (!perfil) redirect("/artista");

  const categorias = await comGuarda(listarCategorias);

  return (
    <>
      <CabecalhoPagina
        titulo="Nova música"
        descricao="A música é publicada no seu perfil de artista."
      />
      <MusicaForm
        action={criarMusicaAction}
        albuns={perfil.albuns}
        categorias={categorias}
      />
    </>
  );
}
