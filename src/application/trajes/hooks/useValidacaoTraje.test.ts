import { renderHook } from '@testing-library/react';
import { useValidacaoTraje } from './useValidacaoTraje';
import { TrajeRequest } from '@domain/entidades';

describe('useValidacaoTraje', () => {
  it('deve retornar erros vazios inicialmente', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    expect(result.current.erros).toEqual({});
  });

  it('deve retornar true quando dados forem válidos', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosValidos: TrajeRequest = {
      nome: 'Traje Formal',
      descricao: 'Traje elegante para eventos',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: 150,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dadosValidos);

    expect(isValido).toBe(true);
  });

  it('deve retornar false quando nome estiver vazio', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosInvalidos: TrajeRequest = {
      nome: '',
      descricao: 'Descrição',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: 150,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dadosInvalidos);

    expect(isValido).toBe(false);
  });

  it('deve retornar false quando descrição estiver vazia', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosInvalidos: TrajeRequest = {
      nome: 'Traje',
      descricao: '',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: 150,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dadosInvalidos);

    expect(isValido).toBe(false);
  });

  it('deve retornar false quando preço for zero', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosInvalidos: TrajeRequest = {
      nome: 'Traje',
      descricao: 'Descrição',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: 0,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dadosInvalidos);

    expect(isValido).toBe(false);
  });

  it('deve retornar false quando preço for negativo', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosInvalidos: TrajeRequest = {
      nome: 'Traje',
      descricao: 'Descrição',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: -10,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dadosInvalidos);

    expect(isValido).toBe(false);
  });

  it('deve retornar false quando campos obrigatórios estiverem ausentes', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dadosInvalidos: TrajeRequest = {
      nome: '',
      descricao: '',
      tecido: '',
      cor: '',
      tipo: '',
      valorItem: 0,
      tamanho: '',
      textura: '',
      status: '',
      genero: '',
      condicao: '',
    };

    const isValido = result.current.validar(dadosInvalidos);

    expect(isValido).toBe(false);
  });

  it('deve ignorar espaços ao validar nome com espaços', () => {
    const { result } = renderHook(() => useValidacaoTraje());

    const dados: TrajeRequest = {
      nome: '   ',
      descricao: 'Descrição',
      tecido: 'Seda',
      cor: 'Preto',
      tipo: 'Formal',
      valorItem: 150,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    const isValido = result.current.validar(dados);

    expect(isValido).toBe(false);
  });
});