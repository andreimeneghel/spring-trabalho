import type { Metadata } from "next";

import { criarAlbumAction } from "../../actions";
import { AlbumForm } from "@/components/artista/album-form";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";

export const metadata: Metadata = { title: "Novo álbum" };

export default function NovoAlbumPage() {
  return (
    <>
      <CabecalhoPagina
        titulo="Novo álbum"
        descricao="O álbum é vinculado ao seu perfil de artista."
      />
      <AlbumForm action={criarAlbumAction} />
    </>
  );
}
