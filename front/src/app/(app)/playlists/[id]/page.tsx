import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Music2, Pencil } from "lucide-react";

import { AdicionarMusicaDialog } from "@/components/playlist/adicionar-musica-dialog";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { ExcluirPlaylistBotao } from "@/components/playlist/excluir-playlist-botao";
import { ListaMusicas } from "@/components/playlist/lista-musicas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarPlaylist } from "@/lib/api/playlists";
import { catalogoEhMock, listarMusicas } from "@/lib/api/musicas";
import { usuarioLogado } from "@/lib/api/usuarios";
import { contarMusicas, formatarData, formatarDuracaoLonga } from "@/lib/utils/formato";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const playlist = await buscarPlaylist(Number(id));
    return { title: playlist.nome };
  } catch {
    // 404/403 sao tratados na própria página; aqui só evitamos quebrar o <head>
    return { title: "Playlist não encontrada" };
  }
}

export default async function PlaylistDetalhePage({ params }: Props) {
  const { id } = await params;
  const playlistId = Number(id);

  if (!Number.isInteger(playlistId) || playlistId < 1) notFound();

  const [playlist, usuario, catalogo] = await Promise.all([
    comGuarda(() => buscarPlaylist(playlistId)).catch((erro) => {
      if (erro instanceof ApiError && erro.status === 404) notFound();
      throw erro;
    }),
    comGuarda(usuarioLogado),
    listarMusicas().catch(() => []),
  ]);

  const ehDono = playlist.donoId === usuario.id;
  const idsNaPlaylist = playlist.musicas.map((m) => m.musicaId);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {/* Capa grande, como nas plataformas de streaming */}
          <span className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-superficie-alta shadow-lg sm:size-36">
            {playlist.capa ? (
              // base64: o next/image nao otimiza data URI
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playlist.capa} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center bg-marca/10">
                <Music2
                  className="size-10 text-marca dark:text-marca-clara"
                  aria-hidden="true"
                />
              </span>
            )}
          </span>

          <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{playlist.nome}</h1>
            {!playlist.publica && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="size-3" />
                Privada
              </Badge>
            )}
          </div>

          {playlist.descricao && (
            <p className="max-w-prose text-sm leading-relaxed text-texto-suave">
              {playlist.descricao}
            </p>
          )}

          <p className="text-sm text-texto-fraco">
            {playlist.donoNome} · {contarMusicas(playlist.totalMusicas)}
            {playlist.duracaoTotal > 0 &&
              ` · ${formatarDuracaoLonga(playlist.duracaoTotal)}`}
            {` · criada em ${formatarData(playlist.criadaEm)}`}
          </p>
          </div>
        </div>

        {ehDono && (
          <div className="flex items-center gap-2">
            <AdicionarMusicaDialog
              playlistId={playlist.id}
              catalogo={catalogo}
              jaNaPlaylist={idsNaPlaylist}
              ehMock={catalogoEhMock()}
            />
            <Button variant="ghost" size="icon" asChild aria-label="Editar playlist">
              <Link href={`/playlists/${playlist.id}/editar`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <ExcluirPlaylistBotao id={playlist.id} nome={playlist.nome} />
          </div>
        )}
      </header>

      {playlist.musicas.length === 0 ? (
        <EstadoVazio
          Icone={Music2}
          titulo="Nenhuma música ainda"
          descricao={
            ehDono
              ? "Use o botão 'Adicionar música' para montar esta playlist."
              : "O dono desta playlist ainda não adicionou músicas."
          }
        />
      ) : (
        <ListaMusicas
          playlistId={playlist.id}
          musicas={playlist.musicas}
          podeEditar={ehDono}
        />
      )}
    </>
  );
}
