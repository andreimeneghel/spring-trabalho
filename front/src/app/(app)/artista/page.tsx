import type { Metadata } from "next";
import Link from "next/link";
import { Disc3, Mic2, Pencil, Plus } from "lucide-react";

import { AlbumCard } from "@/components/artista/album-card";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { meuPerfilArtista } from "@/lib/api/artistas";
import { usuarioLogado } from "@/lib/api/usuarios";
import type { ArtistaDetalhe } from "@/types/api";

export const metadata: Metadata = { title: "Área do artista" };

export default async function ArtistaPage() {
  const usuario = await comGuarda(usuarioLogado);

  // So quem tem conta de ARTISTA pode cadastrar album e musica
  if (usuario.tipo !== "ARTISTA") {
    return (
      <>
        <CabecalhoPagina titulo="Área do artista" />
        <EstadoVazio
          Icone={Mic2}
          titulo="Esta área é só para artistas"
          descricao="Sua conta é de ouvinte. O tipo é definido no cadastro e não pode ser alterado depois."
        />
      </>
    );
  }

  /*
    404 aqui nao e erro: significa que o artista ainda nao criou o perfil.
    O contrato manda mostrar a tela de criacao em vez de uma pagina de erro.
  */
  let perfil: ArtistaDetalhe | null = null;
  try {
    perfil = await comGuarda(meuPerfilArtista);
  } catch (erro) {
    if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
  }

  if (!perfil) {
    return (
      <>
        <CabecalhoPagina titulo="Área do artista" />
        <EstadoVazio
          Icone={Mic2}
          titulo="Você ainda não tem perfil de artista"
          descricao="Crie seu perfil para publicar álbuns e músicas na plataforma."
          acao={
            <Button asChild size="sm">
              <Link href="/artista/novo">Criar perfil de artista</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo={perfil.nomeArtistico}
        descricao={`${perfil.totalAlbuns} ${perfil.totalAlbuns === 1 ? "álbum" : "álbuns"} · ${perfil.totalMusicas} ${perfil.totalMusicas === 1 ? "música" : "músicas"}`}
        acao={
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/artista/albuns/novo">
                <Plus className="size-4" />
                Novo álbum
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Editar perfil">
              <Link href="/artista/editar">
                <Pencil className="size-4" />
              </Link>
            </Button>
          </div>
        }
      />

      {perfil.biografia && (
        <p className="mb-8 max-w-prose text-sm leading-relaxed text-texto-suave">
          {perfil.biografia}
        </p>
      )}

      <h2 className="mb-3 font-bold">Álbuns</h2>

      {perfil.albuns.length === 0 ? (
        <EstadoVazio
          Icone={Disc3}
          titulo="Nenhum álbum ainda"
          descricao="Crie um álbum para começar a publicar suas músicas."
          acao={
            <Button asChild size="sm">
              <Link href="/artista/albuns/novo">Criar primeiro álbum</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {perfil.albuns.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </>
  );
}
