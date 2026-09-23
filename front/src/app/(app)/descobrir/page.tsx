import type { Metadata } from "next";
import { Suspense } from "react";
import { Compass, Disc3, Mic2, SearchX } from "lucide-react";

import { AbasDescobrir, type AbaDescobrir } from "./abas";
import { BuscaInput } from "./busca-input";
import { AlbumPublicoCard } from "@/components/artista/album-publico-card";
import { ArtistaCard } from "@/components/artista/artista-card";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buscarAlbunsPorTitulo,
  buscarArtistasPorNome,
  listarAlbuns,
  listarArtistas,
} from "@/lib/api/artistas";
import { comGuarda } from "@/lib/api/guard";
import { buscarPlaylistsPorNome, listarPlaylists } from "@/lib/api/playlists";

export const metadata: Metadata = { title: "Descobrir" };

type Props = { searchParams: Promise<{ aba?: string; q?: string }> };

const GRID = "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

/** Textos de cada aba, para nao repetir if/else pelo componente. */
const CONTEUDO = {
  playlists: {
    descricao: "Playlists públicas da comunidade.",
    placeholder: "Buscar playlists públicas",
    Icone: Compass,
    vazio: "Nenhuma playlist pública ainda",
    vazioDescricao:
      "Quando outros usuários criarem playlists públicas, elas aparecem aqui.",
    buscaDescricao: "Tente outro termo. A busca só alcança playlists públicas.",
  },
  artistas: {
    descricao: "Artistas que publicam na plataforma.",
    placeholder: "Buscar pelo nome artístico",
    Icone: Mic2,
    vazio: "Nenhum artista ainda",
    vazioDescricao:
      "Quando alguém criar um perfil de artista, ele aparece aqui.",
    buscaDescricao: "Tente outro nome artístico.",
  },
  albuns: {
    descricao: "Álbuns lançados na plataforma.",
    placeholder: "Buscar pelo título",
    Icone: Disc3,
    vazio: "Nenhum álbum ainda",
    vazioDescricao: "Quando um artista publicar um álbum, ele aparece aqui.",
    buscaDescricao: "Tente outro título.",
  },
} as const;

async function Resultados({ aba, q }: { aba: AbaDescobrir; q?: string }) {
  const textos = CONTEUDO[aba];

  // cada aba busca no seu proprio endpoint, mantendo o tipo do retorno
  const lista =
    aba === "artistas"
      ? { tipo: "artistas" as const, itens: await comGuarda(() => (q ? buscarArtistasPorNome(q) : listarArtistas())) }
      : aba === "albuns"
        ? { tipo: "albuns" as const, itens: await comGuarda(() => (q ? buscarAlbunsPorTitulo(q) : listarAlbuns())) }
        : { tipo: "playlists" as const, itens: await comGuarda(() => (q ? buscarPlaylistsPorNome(q) : listarPlaylists())) };

  if (lista.itens.length === 0) {
    return q ? (
      <EstadoVazio
        Icone={SearchX}
        titulo={`Nada encontrado para "${q}"`}
        descricao={textos.buscaDescricao}
      />
    ) : (
      <EstadoVazio
        Icone={textos.Icone}
        titulo={textos.vazio}
        descricao={textos.vazioDescricao}
      />
    );
  }

  return (
    <div className={GRID}>
      {lista.tipo === "artistas" &&
        lista.itens.map((artista) => (
          <ArtistaCard key={artista.id} artista={artista} />
        ))}

      {lista.tipo === "albuns" &&
        lista.itens.map((album) => (
          <AlbumPublicoCard key={album.id} album={album} />
        ))}

      {lista.tipo === "playlists" &&
        lista.itens.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} mostrarDono />
        ))}
    </div>
  );
}

function ResultadosSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
      ))}
    </div>
  );
}

export default async function DescobrirPage({ searchParams }: Props) {
  const { aba, q } = await searchParams;
  const abaAtual: AbaDescobrir =
    aba === "artistas" || aba === "albuns" ? aba : "playlists";

  return (
    <>
      <CabecalhoPagina
        titulo="Descobrir"
        descricao={CONTEUDO[abaAtual].descricao}
      />

      <div className="mb-4">
        <Suspense fallback={<Skeleton className="h-10 w-72 rounded-lg" />}>
          <AbasDescobrir atual={abaAtual} />
        </Suspense>
      </div>

      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-11 max-w-md rounded-lg" />}>
          <BuscaInput
            valorInicial={q}
            placeholder={CONTEUDO[abaAtual].placeholder}
          />
        </Suspense>
      </div>

      {/* a key reativa o Suspense a cada troca de aba ou termo */}
      <Suspense key={`${abaAtual}:${q ?? ""}`} fallback={<ResultadosSkeleton />}>
        <Resultados aba={abaAtual} q={q} />
      </Suspense>
    </>
  );
}
