import {
  calcularResumoFinanceiro,
  calcularResumoFinanceiroDeAluguel,
  calcularResumoFinanceiroDeItens,
} from '@/interfaces-graficas/paginas/alugueis/utils/resumoFinanceiro';

describe('resumoFinanceiro', () => {
  it('decompoe valor total com desconto e multa', () => {
    const resumo = calcularResumoFinanceiro(500, 0, 50);

    expect(resumo.subtotal).toBe(450);
    expect(resumo.desconto).toBe(0);
    expect(resumo.multa).toBe(50);
    expect(resumo.total).toBe(500);
  });

  it('calcula total a partir dos itens com multa prevista', () => {
    const resumo = calcularResumoFinanceiroDeItens(450, 0, 30);

    expect(resumo.subtotal).toBe(450);
    expect(resumo.multa).toBe(30);
    expect(resumo.total).toBe(480);
  });

  it('discrimina subtotal dos trajes e multa no resumo do aluguel', () => {
    const resumo = calcularResumoFinanceiroDeAluguel({
      valorTotal: 1400,
      valorDesconto: 50,
      valorMulta: 1000,
      itens: [{ valorItem: 450 }],
    });

    expect(resumo.subtotal).toBe(450);
    expect(resumo.desconto).toBe(50);
    expect(resumo.multa).toBe(1000);
    expect(resumo.total).toBe(1400);
  });

  it('infere multa quando valorMulta nao veio da API mas o total inclui multa', () => {
    const resumo = calcularResumoFinanceiroDeAluguel({
      valorTotal: 1400,
      valorDesconto: 50,
      valorMulta: 0,
      itens: [{ valorItem: 450 }],
    });

    expect(resumo.subtotal).toBe(450);
    expect(resumo.multa).toBe(1000);
    expect(resumo.total).toBe(1400);
  });
});
