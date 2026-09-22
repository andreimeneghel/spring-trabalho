import type { Metadata } from "next";
import Link from "next/link";
import { ListMusic, Plus } from "lucide-react";

import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { Button } from "@/components/ui/button";
import { comGuarda } from "@/lib/api/guard";
import { listarMinhasPlaylists } from "@/lib/api/playlists";

export const metadata: Metadata = { title: "Minhas playlists" };

export default async function PlaylistsPage() {
  const playlists = await comGuarda(listarMinhasPlaylists);

  return (
    <>
      <CabecalhoPagina
        titulo="Minhas playlists"
        descricao={
          playlists.length > 0
            ? `${playlists.length} ${playlists.length === 1 ? "playlist" : "playlists"}`
            : undefined
        }
        acao={
          <Button asChild>
            <Link href="/playlists/nova">
              <Plus className="size-4" />
              Nova playlist
            </Link>
          </Button>
        }
      />

      {playlists.length === 0 ? (
        <EstadoVazio
          Icone={ListMusic}
          titulo="Você ainda não tem playlists"
          descricao="Crie uma playlist para juntar as músicas que você quer ouvir depois."
          acao={
            <Button asChild size="sm">
              <Link href="/playlists/nova">Criar primeira playlist</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </>
  );
}
