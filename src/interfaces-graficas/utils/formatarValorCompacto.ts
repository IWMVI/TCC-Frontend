export function formatarMoedaCompacta(valor: number): string {
  if (valor <= 0) {
    return '';
  }

  if (valor >= 1_000_000) {
    return `R$ ${(valor / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  }

  if (valor >= 10_000) {
    return `R$ ${Math.round(valor / 1000)} mil`;
  }

  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  }

  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: valor % 1 === 0 ? 0 : 2,
  });
}

export function formatarNumeroCompacto(valor: number): string {
  if (valor <= 0) {
    return '';
  }

  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}
