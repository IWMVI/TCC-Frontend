export interface ResumoFinanceiro {
  subtotal: number;
  desconto: number;
  multa: number;
  total: number;
}

export interface ItemComValor {
  valorItem?: number;
}

export interface DadosResumoAluguel {
  valorTotal: number;
  valorDesconto?: number;
  valorMulta?: number;
  itens?: ItemComValor[];
}

export function somarValorItens(itens?: ItemComValor[]): number {
  if (!itens?.length) {
    return 0;
  }
  return itens.reduce((total, item) => total + (item.valorItem ?? 0), 0);
}

export function calcularResumoFinanceiro(
  valorTotal: number,
  valorDesconto = 0,
  valorMulta = 0,
): ResumoFinanceiro {
  const desconto = valorDesconto ?? 0;
  const multa = valorMulta ?? 0;
  const subtotal = valorTotal + desconto - multa;

  return {
    subtotal,
    desconto,
    multa,
    total: valorTotal,
  };
}

export function calcularResumoFinanceiroDeItens(
  subtotalItens: number,
  valorDesconto = 0,
  valorMulta = 0,
): ResumoFinanceiro {
  const desconto = valorDesconto ?? 0;
  const multa = valorMulta ?? 0;

  return {
    subtotal: subtotalItens,
    desconto,
    multa,
    total: Math.max(0, subtotalItens - desconto + multa),
  };
}

export function calcularResumoFinanceiroDeAluguel(
  aluguel: DadosResumoAluguel,
): ResumoFinanceiro {
  const desconto = aluguel.valorDesconto ?? 0;
  const subtotalItens = somarValorItens(aluguel.itens);

  if (subtotalItens > 0) {
    let multa = aluguel.valorMulta ?? 0;
    const totalSemMulta = Math.max(0, subtotalItens - desconto);

    if (multa <= 0 && aluguel.valorTotal > totalSemMulta) {
      multa = aluguel.valorTotal - totalSemMulta;
    }

    return {
      subtotal: subtotalItens,
      desconto,
      multa,
      total: aluguel.valorTotal,
    };
  }

  return calcularResumoFinanceiro(
    aluguel.valorTotal,
    desconto,
    aluguel.valorMulta ?? 0,
  );
}
