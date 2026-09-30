import type { Metadata } from "next";
import Link from "next/link";
import { Disc3, Mic2, Music2, Pencil, Plus } from "lucide-react";

import { AlbumCard } from "@/components/artista/album-card";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { MusicaCard } from "@/components/musica/musica-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { meuPerfilArtista } from "@/lib/api/artistas";
import { listarMinhasMusicas } from "@/lib/api/musicas";
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

  const musicas = await comGuarda(listarMinhasMusicas);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-full">
            {perfil.foto ? (
              // base64: o next/image nao otimiza data URI
              // eslint-disable-next-line @next/next/no-img-element
              <img src={perfil.foto} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center bg-gradient-to-br from-marca/25 to-marca/5">
                <Mic2
                  className="size-7 text-marca dark:text-marca-clara"
                  aria-hidden="true"
                />
              </span>
            )}
          </span>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {perfil.nomeArtistico}
            </h1>
            <p className="text-sm text-texto-suave">
              {perfil.totalAlbuns} {perfil.totalAlbuns === 1 ? "álbum" : "álbuns"} ·{" "}
              {perfil.totalMusicas} {perfil.totalMusicas === 1 ? "música" : "músicas"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/artista/musicas/nova">
              <Plus className="size-4" />
              Nova música
            </Link>
          </Button>
          <Button variant="outline" asChild>
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
      </div>

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

      <h2 className="mb-3 mt-8 font-bold">Músicas</h2>

      {musicas.length === 0 ? (
        <EstadoVazio
          Icone={Music2}
          titulo="Nenhuma música publicada"
          descricao="Publique sua primeira música. Ela pode entrar em um álbum seu ou ficar como single."
          acao={
            <Button asChild size="sm">
              <Link href="/artista/musicas/nova">Publicar música</Link>
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-superficie">
          {musicas.map((musica) => (
            <MusicaCard key={musica.id} musica={musica} />
          ))}
        </ul>
      )}
    </>
  );
}
