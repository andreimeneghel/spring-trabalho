import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disc3, Mic2, Music2, Star } from "lucide-react";

import { AvaliacaoCard } from "@/components/avaliacao/avaliacao-card";
import { EstrelasLeitura } from "@/components/avaliacao/estrelas";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { AdicionarAPlaylistDialog } from "@/components/musica/adicionar-a-playlist-dialog";
import { AvaliarDialog } from "@/components/musica/avaliar-dialog";
import { Badge } from "@/components/ui/badge";
import { meuPerfilArtista } from "@/lib/api/artistas";
import { buscarMedia, listarAvaliacoesDaMusica } from "@/lib/api/avaliacoes";
import { ApiError } from "@/lib/api/errors";
import { comGuarda } from "@/lib/api/guard";
import { buscarMusica } from "@/lib/api/musicas";
import { listarMinhasPlaylists } from "@/lib/api/playlists";
import { usuarioLogado } from "@/lib/api/usuarios";
import { contarAvaliacoes, formatarDuracao } from "@/lib/utils/formato";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const musica = await buscarMusica(Number(id));
    return { title: musica.titulo };
  } catch {
    // 404 é tratado na própria página; aqui só evitamos quebrar o <head>
    return { title: "Música não encontrada" };
  }
}

/** Detalhe público: qualquer usuário logado pode ver. */
export default async function MusicaDetalhePage({ params }: Props) {
  const { id } = await params;
  const musicaId = Number(id);

  if (!Number.isInteger(musicaId) || musicaId < 1) notFound();

  /*
    A musica vem primeiro, sozinha: as avaliacoes e a media tambem respondem 404
    para um id que nao existe, e num Promise.all o erro delas chegaria antes do
    notFound() daqui — a tela virava 500 em vez da pagina de nao encontrado.
  */
  const musica = await comGuarda(() => buscarMusica(musicaId)).catch((erro) => {
    if (erro instanceof ApiError && erro.status === 404) notFound();
    throw erro;
  });

  const [usuario, avaliacoes, media, playlists] = await Promise.all([
    comGuarda(usuarioLogado),
    comGuarda(() => listarAvaliacoesDaMusica(musicaId)),
    comGuarda(() => buscarMedia(musicaId)),
    comGuarda(listarMinhasPlaylists),
  ]);

  const minhaAvaliacao = avaliacoes.find((a) => a.usuarioId === usuario.id);

  /*
    A API recusa o artista avaliar a própria música (400). Só vale consultar o
    perfil de artista quando a conta é do tipo ARTISTA — ouvinte nunca tem perfil.
  */
  let ehMinhaMusica = false;
  if (usuario.tipo === "ARTISTA") {
    try {
      const perfil = await comGuarda(meuPerfilArtista);
      ehMinhaMusica = perfil.id === musica.artistaId;
    } catch (erro) {
      if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
    }
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-start gap-5">
        <span className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-superficie-alta shadow-lg sm:size-32">
          {musica.albumCapa ? (
            // base64: o next/image nao otimiza data URI
            // eslint-disable-next-line @next/next/no-img-element
            <img src={musica.albumCapa} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center bg-marca/10">
              <Music2
                className="size-10 text-marca dark:text-marca-clara"
                aria-hidden="true"
              />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm text-texto-fraco">Música</p>
          <h1 className="text-3xl font-bold tracking-tight">{musica.titulo}</h1>

          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-texto-suave">
            <Mic2 className="size-4 shrink-0" aria-hidden="true" />
            <Link
              href={`/artistas/${musica.artistaId}`}
              className="font-bold hover:underline"
            >
              {musica.artistaNome}
            </Link>
            {musica.albumTitulo && (
              <>
                <span aria-hidden="true">·</span>
                <Disc3 className="size-4 shrink-0" aria-hidden="true" />
                {musica.albumTitulo}
                {musica.albumAnoLancamento && ` (${musica.albumAnoLancamento})`}
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatarDuracao(musica.duracao)}</span>
          </p>

          {musica.categorias.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {musica.categorias.map((categoria) => (
                <Badge key={categoria.id} variant="secondary" asChild>
                  <Link href={`/descobrir?aba=musicas&categoria=${categoria.id}`}>
                    {categoria.nome}
                  </Link>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <AdicionarAPlaylistDialog
              musicaId={musica.id}
              titulo={musica.titulo}
              playlists={playlists}
            />

            {!ehMinhaMusica && (
              <AvaliarDialog
                musicaId={musica.id}
                titulo={musica.titulo}
                minhaAvaliacao={minhaAvaliacao}
              />
            )}
          </div>
        </div>
      </header>

      <section className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-superficie px-4 py-3">
        {media.totalAvaliacoes > 0 ? (
          <>
            <span className="text-2xl font-bold tabular-nums">
              {media.media.toFixed(1)}
            </span>
            <EstrelasLeitura nota={media.media} />
            <span className="text-sm text-texto-suave">
              {contarAvaliacoes(media.totalAvaliacoes)}
            </span>
          </>
        ) : (
          <span className="text-sm text-texto-suave">
            Esta música ainda não tem avaliações
            {ehMinhaMusica ? "." : " — seja o primeiro a dar uma nota."}
          </span>
        )}
      </section>

      <h2 className="mb-3 font-bold">Avaliações</h2>

      {avaliacoes.length === 0 ? (
        <EstadoVazio
          Icone={Star}
          titulo="Nenhuma avaliação ainda"
          descricao={
            ehMinhaMusica
              ? "Você não pode avaliar a sua própria música — espere as notas dos ouvintes."
              : "Use o botão Avaliar para deixar a sua nota de 1 a 5 e um comentário."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {avaliacoes.map((avaliacao) =>
            avaliacao.usuarioId === usuario.id ? (
              // a minha avaliação vem editável, como na tela "Minhas avaliações"
              <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
            ) : (
              <article
                key={avaliacao.id}
                className="space-y-2 rounded-lg border border-border bg-superficie p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold">{avaliacao.usuarioNome}</p>
                  <EstrelasLeitura nota={avaliacao.nota} />
                </div>
                {avaliacao.comentario && (
                  <p className="text-sm leading-relaxed text-texto-suave">
                    {avaliacao.comentario}
                  </p>
                )}
              </article>
            ),
          )}
        </div>
      )}
    </>
  );
}
