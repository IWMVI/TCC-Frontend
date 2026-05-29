import { normalizarDataIso } from '@domain/utils/dataIso';
import {
  formatarDataBr,
  formatarDataExtensoBr,
} from '@/interfaces-graficas/utils/formatarData';

describe('formatarDataBr', () => {
  it('formata data ISO como dd/mm/aaaa', () => {
    expect(formatarDataBr('2026-05-15')).toBe('15/05/2026');
  });

  it('formata data ISO com horário sem deslocar o dia', () => {
    expect(formatarDataBr('2026-05-15T00:00:00')).toBe('15/05/2026');
  });

  it('mantém data já informada no padrão brasileiro', () => {
    expect(formatarDataBr('15/05/2026')).toBe('15/05/2026');
  });

  it('formata array de data do backend', () => {
    expect(formatarDataBr(normalizarDataIso([2026, 5, 1]))).toBe('01/05/2026');
  });
});

describe('formatarDataExtensoBr', () => {
  it('formata data por extenso em português', () => {
    expect(formatarDataExtensoBr('2026-05-15')).toMatch(/15/);
    expect(formatarDataExtensoBr('2026-05-15')).toMatch(/2026/);
  });
});
