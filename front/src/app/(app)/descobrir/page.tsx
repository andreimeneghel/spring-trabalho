import type { Metadata } from "next";
import { Suspense } from "react";
import { Compass, SearchX } from "lucide-react";

import { BuscaInput } from "./busca-input";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { Skeleton } from "@/components/ui/skeleton";
import { comGuarda } from "@/lib/api/guard";
import { buscarPlaylistsPorNome, listarPlaylists } from "@/lib/api/playlists";

export const metadata: Metadata = { title: "Descobrir" };

type Props = { searchParams: Promise<{ nome?: string }> };

async function Resultados({ nome }: { nome?: string }) {
  const playlists = await comGuarda(() =>
    nome ? buscarPlaylistsPorNome(nome) : listarPlaylists(),
  );

  if (playlists.length === 0) {
    return nome ? (
      <EstadoVazio
        Icone={SearchX}
        titulo={`Nada encontrado para "${nome}"`}
        descricao="Tente outro termo. A busca só alcança playlists públicas."
      />
    ) : (
      <EstadoVazio
        Icone={Compass}
        titulo="Nenhuma playlist pública ainda"
        descricao="Quando outros usuários criarem playlists públicas, elas aparecem aqui."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} mostrarDono />
      ))}
    </div>
  );
}

function ResultadosSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}

export default async function DescobrirPage({ searchParams }: Props) {
  const { nome } = await searchParams;

  return (
    <>
      <CabecalhoPagina
        titulo="Descobrir"
        descricao="Playlists públicas da comunidade."
      />

      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-9 max-w-md" />}>
          <BuscaInput valorInicial={nome} />
        </Suspense>
      </div>

      {/* key faz o Suspense reativar a cada termo novo */}
      <Suspense key={nome ?? ""} fallback={<ResultadosSkeleton />}>
        <Resultados nome={nome} />
      </Suspense>
    </>
  );
}
