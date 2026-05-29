export function formatarMesAnoCurto(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split('-').map(Number);
  if (!ano || !mes) {
    return mesReferencia;
  }

  const data = new Date(ano, mes - 1, 1);
  const mesTxt = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const anoTxt = String(ano).slice(-2);

  return `${mesTxt}/${anoTxt}`;
}
