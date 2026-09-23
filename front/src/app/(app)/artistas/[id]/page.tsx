import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Disc3, Mic2 } from "lucide-react";

import { EstadoVazio } from "@/components/comum/estado-vazio";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarArtista } from "@/lib/api/artistas";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const artista = await buscarArtista(Number(id));
    return { title: artista.nomeArtistico };
  } catch {
    return { title: "Artista não encontrado" };
  }
}

/** Perfil publico: qualquer usuario logado pode ver. */
export default async function ArtistaPublicoPage({ params }: Props) {
  const { id } = await params;
  const artistaId = Number(id);

  if (!Number.isInteger(artistaId) || artistaId < 1) notFound();

  const artista = await comGuarda(() => buscarArtista(artistaId)).catch(
    (erro) => {
      if (erro instanceof ApiError && erro.status === 404) notFound();
      throw erro;
    },
  );

  const plural = (n: number, um: string, muitos: string) =>
    `${n} ${n === 1 ? um : muitos}`;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center gap-5">
        <span className="relative size-28 shrink-0 overflow-hidden rounded-full sm:size-32">
          {artista.foto ? (
            // base64: o next/image nao otimiza data URI
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artista.foto} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center bg-gradient-to-br from-marca/25 to-marca/5">
              <Mic2
                className="size-12 text-marca dark:text-marca-clara"
                aria-hidden="true"
              />
            </span>
          )}
        </span>

        <div className="min-w-0 space-y-2">
          <p className="text-sm text-texto-fraco">Artista</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {artista.nomeArtistico}
          </h1>
          <p className="text-sm text-texto-suave">
            {plural(artista.totalAlbuns, "álbum", "álbuns")} ·{" "}
            {plural(artista.totalMusicas, "música", "músicas")}
          </p>
        </div>
      </header>

      {artista.biografia && (
        <p className="mb-8 max-w-prose text-sm leading-relaxed text-texto-suave">
          {artista.biografia}
        </p>
      )}

      <h2 className="mb-3 font-bold">Álbuns</h2>

      {artista.albuns.length === 0 ? (
        <EstadoVazio
          Icone={Disc3}
          titulo="Nenhum álbum publicado"
          descricao={`${artista.nomeArtistico} ainda não lançou nenhum álbum.`}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-superficie">
          {artista.albuns.map((album) => (
            <li key={album.id} className="flex items-center gap-4 px-4 py-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-md">
                {album.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.capa} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center bg-marca/10">
                    <Disc3
                      className="size-5 text-marca dark:text-marca-clara"
                      aria-hidden="true"
                    />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{album.titulo}</p>
                <p className="text-sm text-texto-suave">
                  {album.anoLancamento ?? "Ano não informado"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
