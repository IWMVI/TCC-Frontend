import {
  mascararCpfCnpj,
  mascararCelular,
  mascararTelefone,
  mascararCep,
} from './formatacoes';

describe('mascararCpfCnpj', () => {
  it('deve formatar CPF corretamente', () => {
    expect(mascararCpfCnpj('12345678901')).toBe('123.456.789-01');
    expect(mascararCpfCnpj('123456789')).toBe('123.456.789');
    expect(mascararCpfCnpj('123456')).toBe('123.456');
  });

  it('deve formatar CNPJ corretamente', () => {
    expect(mascararCpfCnpj('12345678901234')).toBe('12.345.678/9012-34');
    expect(mascararCpfCnpj('123456789012')).toBe('12.345.678/9012');
    expect(mascararCpfCnpj('12345678')).toBe('123.456.78');
  });

  it('deve retornar string vazia quando entrada for vazia', () => {
    expect(mascararCpfCnpj('')).toBe('');
  });

  it('deve lidar com valores parciais corretamente', () => {
    expect(mascararCpfCnpj('1')).toBe('1');
    expect(mascararCpfCnpj('12')).toBe('12');
    expect(mascararCpfCnpj('123')).toBe('123');
    expect(mascararCpfCnpj('1234')).toBe('123.4');
  });
});

describe('mascararCelular', () => {
  it('deve formatar celular corretamente', () => {
    expect(mascararCelular('11999999999')).toBe('(11) 99999-9999');
    expect(mascararCelular('11988888888')).toBe('(11) 98888-8888');
  });

  it('deve lidar com valores parciais', () => {
    expect(mascararCelular('11')).toBe('11');
    expect(mascararCelular('119')).toBe('(11) 9');
    expect(mascararCelular('1199999')).toBe('(11) 99999');
    expect(mascararCelular('11999999999')).toBe('(11) 99999-9999');
  });

  it('deve retornar string vazia quando entrada for vazia', () => {
    expect(mascararCelular('')).toBe('');
  });
});

describe('mascararTelefone', () => {
  it('deve formatar telefone fixo corretamente', () => {
    expect(mascararTelefone('1133334444')).toBe('(11) 3333-4444');
    expect(mascararTelefone('2122223333')).toBe('(21) 2222-3333');
  });

  it('deve lidar com valores parciais', () => {
    expect(mascararTelefone('11')).toBe('11');
    expect(mascararTelefone('113')).toBe('(11) 3');
    expect(mascararTelefone('113333')).toBe('(11) 3333');
    expect(mascararTelefone('1133334')).toBe('(11) 3333-4');
  });

  it('deve retornar string vazia quando entrada for vazia', () => {
    expect(mascararTelefone('')).toBe('');
  });
});

describe('mascararCep', () => {
  it('deve formatar CEP corretamente', () => {
    expect(mascararCep('01001000')).toBe('01001-000');
    expect(mascararCep('12345678')).toBe('12345-678');
  });

  it('deve lidar com valores parciais', () => {
    expect(mascararCep('01001')).toBe('01001');
    expect(mascararCep('010010')).toBe('01001-0');
    expect(mascararCep('0100100')).toBe('01001-00');
  });

  it('deve retornar string vazia quando entrada for vazia', () => {
    expect(mascararCep('')).toBe('');
  });
});
