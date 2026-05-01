import { StatusAluguel, TipoOcasiao } from '@/domain/entidades/Aluguel';

describe('StatusAluguel', () => {
  it('deve possuir valores legíveis para interface do usuário', () => {
    expect(StatusAluguel.ATIVO).toBe('Ativo');
    expect(StatusAluguel.CONCLUIDO).toBe('Concluído');
    expect(StatusAluguel.CANCELADO).toBe('Cancelado');
  });

  it('deve conter exatamente 3 status', () => {
    expect(Object.keys(StatusAluguel)).toHaveLength(3);
  });
});

describe('TipoOcasiao', () => {
  it('deve possuir todos os tipos de ocasião esperados', () => {
    expect(Object.values(TipoOcasiao)).toContain('CASAMENTO');
    expect(Object.values(TipoOcasiao)).toContain('FORMATURA');
    expect(Object.values(TipoOcasiao)).toContain('BAILE_DE_GALA');
    expect(Object.values(TipoOcasiao)).toContain('FESTA_FORMAL');
    expect(Object.values(TipoOcasiao)).toContain('EVENTO_CORPORATIVO');
    expect(Object.values(TipoOcasiao)).toContain('JANTAR_FORMAL');
    expect(Object.values(TipoOcasiao)).toContain('CERIMONIA');
  });

  it('deve conter exatamente 7 tipos de ocasião', () => {
    expect(Object.keys(TipoOcasiao)).toHaveLength(7);
  });
});
