export type PaletaGraficoDashboard = 'sucesso' | 'info' | 'aviso' | 'erro';

export type TomGraficoDashboard = 'vivido' | 'sobrio';

const MATIZ_POR_PALETA: Record<PaletaGraficoDashboard, number> = {
  sucesso: 145,
  info: 211,
  aviso: 32,
  erro: 4,
};

const MATIZ_NEUTRO = 220;

function progressoIndice(indice: number, total: number): number {
  return total <= 1 ? 1 : indice / (total - 1);
}

export function corBarraGraficoMensal(
  paleta: PaletaGraficoDashboard,
  indice: number,
  total: number,
  ehUltimo: boolean,
  tom: TomGraficoDashboard = 'vivido',
): string {
  const progresso = progressoIndice(indice, total);

  if (tom === 'sobrio') {
    const saturacao = Math.round(10 + progresso * 8);
    const luminosidade = ehUltimo ? 32 : Math.round(50 - progresso * 12);
    return `hsl(${MATIZ_NEUTRO} ${saturacao}% ${luminosidade}%)`;
  }

  const saturacao = Math.round(42 + progresso * 38);
  const luminosidade = ehUltimo ? 40 : Math.round(52 - progresso * 12);

  return `hsl(${MATIZ_POR_PALETA[paleta]} ${saturacao}% ${luminosidade}%)`;
}

export function corTextoGraficoMensal(
  paleta: PaletaGraficoDashboard,
  indice: number,
  total: number,
  tom: TomGraficoDashboard = 'vivido',
): string | undefined {
  if (tom === 'sobrio') {
    return undefined;
  }

  const progresso = progressoIndice(indice, total);
  const saturacao = Math.round(50 + progresso * 30);
  const luminosidade = Math.round(28 + progresso * 8);

  return `hsl(${MATIZ_POR_PALETA[paleta]} ${saturacao}% ${luminosidade}%)`;
}
