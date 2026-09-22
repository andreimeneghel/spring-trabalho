import type { Metadata } from "next";
import { Star } from "lucide-react";

import { AvaliacaoCard } from "@/components/avaliacao/avaliacao-card";
import { CabecalhoPagina } from "@/components/comum/cabecalho-pagina";
import { EstadoVazio } from "@/components/comum/estado-vazio";
import { comGuarda } from "@/lib/api/guard";
import { listarMinhasAvaliacoes } from "@/lib/api/avaliacoes";
import { contarAvaliacoes } from "@/lib/utils/formato";

export const metadata: Metadata = { title: "Minhas avaliações" };

export default async function AvaliacoesPage() {
  const avaliacoes = await comGuarda(listarMinhasAvaliacoes);

  const media =
    avaliacoes.length > 0
      ? avaliacoes.reduce((soma, a) => soma + a.nota, 0) / avaliacoes.length
      : 0;

  return (
    <>
      <CabecalhoPagina
        titulo="Minhas avaliações"
        descricao={
          avaliacoes.length > 0
            ? `${contarAvaliacoes(avaliacoes.length)} · média das suas notas: ${media.toFixed(1)}`
            : undefined
        }
      />

      {avaliacoes.length === 0 ? (
        <EstadoVazio
          Icone={Star}
          titulo="Você ainda não avaliou nenhuma música"
          descricao="Ao ouvir uma música, deixe sua nota de 1 a 5 e um comentário. Suas avaliações aparecem aqui para editar quando quiser."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {avaliacoes.map((avaliacao) => (
            <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
          ))}
        </div>
      )}
    </>
  );
}
