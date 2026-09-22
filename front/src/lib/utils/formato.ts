/** 390 -> "6:30" */
export function formatarDuracao(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

/** 3870 -> "1 h 4 min" · 390 -> "6 min" */
export function formatarDuracaoLonga(segundos: number): string {
  if (segundos === 0) return "0 min";

  const horas = Math.floor(segundos / 3600);
  const min = Math.round((segundos % 3600) / 60);

  if (horas === 0) return `${min} min`;
  if (min === 0) return `${horas} h`;
  return `${horas} h ${min} min`;
}

/** "2026-09-22T10:15:30" -> "22 de set. de 2026" */
export function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "12 musicas" · "1 musica" · "Nenhuma musica" */
export function contarMusicas(total: number): string {
  if (total === 0) return "Nenhuma musica";
  if (total === 1) return "1 musica";
  return `${total} musicas`;
}

export function contarAvaliacoes(total: number): string {
  if (total === 0) return "Sem avaliacoes";
  if (total === 1) return "1 avaliacao";
  return `${total} avaliacoes`;
}

/** Iniciais para o avatar: "Luiz Fellipe Rocha" -> "LR" */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
