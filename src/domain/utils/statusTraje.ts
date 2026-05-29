export function normalizarStatusTraje(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function trajeEstaAlugado(status: string): boolean {
  return normalizarStatusTraje(status) === 'alugado';
}

export function trajePermiteAluguel(status: string): boolean {
  return normalizarStatusTraje(status) === 'disponivel';
}
