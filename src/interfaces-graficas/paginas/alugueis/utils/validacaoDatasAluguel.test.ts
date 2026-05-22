import {
  dataDevolucaoComConflitoReserva,
  dataDevolucaoIndisponivel,
  dataRetiradaIndisponivel,
  diaSeguinte,
  periodosConflitam,
} from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';

describe('validacaoDatasAluguel', () => {
  const periodos = [{ dataRetirada: '2026-05-28', dataDevolucao: '2026-05-31' }];

  it('identifica retirada em periodo reservado', () => {
    expect(dataRetiradaIndisponivel('2026-05-29', periodos)).toBe(true);
    expect(dataRetiradaIndisponivel('2026-06-01', periodos)).toBe(false);
  });

  it('impede devolucao anterior ou igual a retirada na validacao do formulario', () => {
    expect(dataDevolucaoIndisponivel('2026-06-01', '2026-06-01', periodos)).toBe(true);
    expect(dataDevolucaoIndisponivel('2026-06-01', '2026-05-31', periodos)).toBe(true);
  });

  it('nao marca devolucao anterior a retirada como reserva no calendario', () => {
    expect(dataDevolucaoComConflitoReserva('2026-06-01', '2026-05-31', periodos)).toBe(false);
  });

  it('detecta conflito de intervalo', () => {
    expect(periodosConflitam('2026-05-30', '2026-06-02', periodos)).toBe(true);
    expect(periodosConflitam('2026-06-02', '2026-06-05', periodos)).toBe(false);
  });

  it('calcula dia seguinte', () => {
    expect(diaSeguinte('2026-05-31')).toBe('2026-06-01');
  });
});
