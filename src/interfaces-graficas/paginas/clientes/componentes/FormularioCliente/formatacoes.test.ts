import { formatarMedida } from '@/interfaces-graficas/paginas/clientes/componentes/FormularioCliente/formatacoes';

describe('formatarMedida', () => {
  it('deve formatar número 100 como "1,00"', () => {
    expect(formatarMedida(100)).toBe('1,00');
  });

  it('deve formatar número 10 como "0,10"', () => {
    expect(formatarMedida(10)).toBe('0,10');
  });

  it('deve formatar número 1 como "0,01"', () => {
    expect(formatarMedida(1)).toBe('0,01');
  });

  it('deve formatar número 0 como "0,00"', () => {
    expect(formatarMedida(0)).toBe('0,00');
  });

  it('deve formatar número undefined como "0,00"', () => {
    expect(formatarMedida(undefined)).toBe('0,00');
  });

  it('deve formatar número 1234 como "12,34"', () => {
    expect(formatarMedida(1234)).toBe('12,34');
  });

  it('deve formatar número 99999 como "999,99"', () => {
    expect(formatarMedida(99999)).toBe('999,99');
  });
});
