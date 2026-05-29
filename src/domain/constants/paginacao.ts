export const TAMANHO_PAGINA_PADRAO = 10;

export function calcularTotalPaginas(
  totalRegistros: number,
  tamanhoPagina = TAMANHO_PAGINA_PADRAO,
): number {
  if (totalRegistros <= 0) {
    return 1;
  }
  return Math.ceil(totalRegistros / tamanhoPagina);
}

export function paginarLista<T>(
  itens: T[],
  pagina: number,
  tamanhoPagina = TAMANHO_PAGINA_PADRAO,
): T[] {
  const inicio = pagina * tamanhoPagina;
  return itens.slice(inicio, inicio + tamanhoPagina);
}
