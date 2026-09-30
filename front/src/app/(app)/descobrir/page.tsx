import type { Metadata } from "next";
import { Suspense } from "react";
import { Compass, Disc3, Mic2, Music2, SearchX } from "lucide-react";

import { AbasDescobrir, type AbaDescobrir } from "./abas";
import { BuscaInput } from "./busca-input";
import { AlbumPublicoCard } from "@/components/artista/album-publico-card";
import { ArtistaCard } from "@/components/artista/artista-card";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { FiltroCategorias } from "@/components/musica/filtro-categorias";
import { MusicaItem } from "@/components/musica/musica-item";
import { PlaylistCard } from "@/components/playlist/playlist-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buscarAlbunsPorTitulo,
  buscarArtistasPorNome,
  listarAlbuns,
  listarArtistas,
} from "@/lib/api/artistas";
import { comGuarda } from "@/lib/api/guard";
import {
  buscarMusicasPorTitulo,
  listarCategorias,
  listarMusicas,
  listarMusicasDaCategoria,
} from "@/lib/api/musicas";
import { buscarPlaylistsPorNome, listarPlaylists } from "@/lib/api/playlists";
import type { MusicaResumo } from "@/types/api";

export const metadata: Metadata = { title: "Descobrir" };

type Props = {
  searchParams: Promise<{ aba?: string; q?: string; categoria?: string }>;
};

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
  musicas: {
    descricao: "Catálogo de músicas publicadas pelos artistas.",
    placeholder: "Buscar pelo título",
    Icone: Music2,
    vazio: "Nenhuma música ainda",
    vazioDescricao:
      "Quando um artista publicar uma música, ela aparece aqui para entrar nas suas playlists.",
    buscaDescricao: "Tente outro título ou remova o filtro de categoria.",
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

/**
 * A API tem um endpoint por filtro (`/musicas/busca` e `/musicas/categoria/{id}`),
 * entao quando os dois vem juntos a lista sai da categoria e o titulo e filtrado
 * aqui. Sao poucas musicas num trabalho academico; um endpoint com os dois
 * filtros seria o caminho se o catalogo crescesse.
 */
async function buscarMusicasDaAba(q?: string, categoriaId?: number) {
  let musicas: MusicaResumo[];

  if (categoriaId) {
    musicas = await comGuarda(() => listarMusicasDaCategoria(categoriaId));
  } else if (q) {
    musicas = await comGuarda(() => buscarMusicasPorTitulo(q));
  } else {
    musicas = await comGuarda(listarMusicas);
  }

  if (q && categoriaId) {
    const termo = q.trim().toLowerCase();
    musicas = musicas.filter((m) => m.titulo.toLowerCase().includes(termo));
  }

  return musicas;
}

async function Resultados({
  aba,
  q,
  categoriaId,
}: {
  aba: AbaDescobrir;
  q?: string;
  categoriaId?: number;
}) {
  const textos = CONTEUDO[aba];

  // cada aba busca no seu proprio endpoint, mantendo o tipo do retorno
  const lista =
    aba === "artistas"
      ? { tipo: "artistas" as const, itens: await comGuarda(() => (q ? buscarArtistasPorNome(q) : listarArtistas())) }
      : aba === "albuns"
        ? { tipo: "albuns" as const, itens: await comGuarda(() => (q ? buscarAlbunsPorTitulo(q) : listarAlbuns())) }
        : aba === "musicas"
          ? { tipo: "musicas" as const, itens: await buscarMusicasDaAba(q, categoriaId) }
          : { tipo: "playlists" as const, itens: await comGuarda(() => (q ? buscarPlaylistsPorNome(q) : listarPlaylists())) };

  if (lista.itens.length === 0) {
    return q || categoriaId ? (
      <EstadoVazio
        Icone={SearchX}
        titulo={q ? `Nada encontrado para "${q}"` : "Nenhuma música nesta categoria"}
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

  // musica e uma lista de linhas; o resto sao cards em grade
  if (lista.tipo === "musicas") {
    return (
      <ul className="divide-y divide-border rounded-lg border border-border bg-superficie">
        {lista.itens.map((musica) => (
          <MusicaItem key={musica.id} musica={musica} />
        ))}
      </ul>
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

function ListaSkeleton() {
  return (
    <div className="space-y-px overflow-hidden rounded-lg border border-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-none" />
      ))}
    </div>
  );
}

/** As categorias sao carregadas em paralelo com os resultados da aba. */
async function Filtro({ selecionada, termo }: { selecionada?: number; termo?: string }) {
  const categorias = await comGuarda(listarCategorias);
  return (
    <FiltroCategorias
      categorias={categorias}
      selecionada={selecionada}
      termo={termo}
    />
  );
}

export default async function DescobrirPage({ searchParams }: Props) {
  const { aba, q, categoria } = await searchParams;
  const abaAtual: AbaDescobrir =
    aba === "artistas" || aba === "albuns" || aba === "musicas" ? aba : "playlists";

  const categoriaId =
    abaAtual === "musicas" && categoria && Number.isInteger(Number(categoria))
      ? Number(categoria)
      : undefined;

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

      <div className="mb-6 space-y-4">
        <Suspense fallback={<Skeleton className="h-11 max-w-md rounded-lg" />}>
          <BuscaInput
            valorInicial={q}
            placeholder={CONTEUDO[abaAtual].placeholder}
          />
        </Suspense>

        {abaAtual === "musicas" && (
          <Suspense fallback={<Skeleton className="h-8 max-w-xl rounded-full" />}>
            <Filtro selecionada={categoriaId} termo={q} />
          </Suspense>
        )}
      </div>

      {/* a key reativa o Suspense a cada troca de aba, termo ou categoria */}
      <Suspense
        key={`${abaAtual}:${q ?? ""}:${categoriaId ?? ""}`}
        fallback={abaAtual === "musicas" ? <ListaSkeleton /> : <ResultadosSkeleton />}
      >
        <Resultados aba={abaAtual} q={q} categoriaId={categoriaId} />
      </Suspense>
    </>
  );
}
