import { renderHook, act } from '@testing-library/react';
import { useFormTraje, formatarValorDigitado } from '@/application/trajes/hooks/useFormTraje';

describe('useFormTraje', () => {
  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useFormTraje());

    expect(result.current.formData.nome).toBe('');
    expect(result.current.formData.descricao).toBe('');
    expect(result.current.formData.valorItem).toBe(0);
    expect(result.current.imagemPreview).toBe('');
    expect(result.current.errosValidacao).toEqual({});
    expect(result.current.estaEnviando).toBe(false);
  });

  it('deve atualizar campo quando setField for chamado', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setField('nome', 'Traje Formal');
    });

    expect(result.current.formData.nome).toBe('Traje Formal');
  });

  it('deve limpar erro do campo quando setField for chamado', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setErro('nome', 'Nome obrigatório');
    });

    act(() => {
      result.current.setField('nome', 'Novo nome');
    });

    expect(result.current.errosValidacao.nome).toBeUndefined();
  });

  it('deve atualizar valorItem corretamente com setValorItem', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setValorItem('150,00', 150);
    });

    expect(result.current.formData.valorItem).toBe(150);
  });

  it('deve limpar erro de valorItem quando setValorItem for chamado', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setErro('valorItem', 'Preço obrigatório');
    });

    act(() => {
      result.current.setValorItem('100,00', 100);
    });

    expect(result.current.errosValidacao.valorItem).toBeUndefined();
  });

  it('deve definir erro com setErro', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setErro('nome', 'Nome obrigatório');
    });

    expect(result.current.errosValidacao.nome).toBe('Nome obrigatório');
  });

  it('deve limpar imagem com setImagemPreview', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setImagemPreview('http://exemplo.com/imagem.jpg');
    });

    expect(result.current.imagemPreview).toBe('http://exemplo.com/imagem.jpg');
  });

  it('deve limpar formulário com limparFormulario', () => {
    const { result } = renderHook(() => useFormTraje());

    act(() => {
      result.current.setField('nome', 'Traje Teste');
      result.current.setField('descricao', 'Descrição teste');
      result.current.setErro('nome', 'Erro');
    });

    act(() => {
      result.current.limparFormulario();
    });

    expect(result.current.formData.nome).toBe('');
    expect(result.current.formData.descricao).toBe('');
    expect(result.current.errosValidacao).toEqual({});
  });

  it('deve inicializar com trajeInicial quando fornecido', () => {
    const trajeInicial = {
      nome: 'Traje Inicial',
      descricao: 'Descrição inicial',
      valorItem: 200,
    };

    const { result } = renderHook(() => useFormTraje({ trajeInicial }));

    expect(result.current.formData.nome).toBe('Traje Inicial');
    expect(result.current.formData.descricao).toBe('Descrição inicial');
    expect(result.current.formData.valorItem).toBe(200);
  });
});

describe('formatarValorDigitado', () => {
  it('deve formatar string vazia para valor 0', () => {
    const resultado = formatarValorDigitado('');
    expect(resultado).toEqual({ display: '', numeric: 0 });
  });

  it('deve formatar valor sem vírgula corretamente', () => {
    const resultado = formatarValorDigitado('100');
    expect(resultado).toEqual({ display: '1,00', numeric: 1 });
  });

  it('deve formatar valor com vírgula corretamente', () => {
    const resultado = formatarValorDigitado('1500');
    expect(resultado).toEqual({ display: '15,00', numeric: 15 });
  });

  it('deve formatar valor com múltiplos dígitos corretamente', () => {
    const resultado = formatarValorDigitado('123456');
    expect(resultado).toEqual({ display: '1.234,56', numeric: 1234.56 });
  });

  it('deve ignorar caracteres não numéricos', () => {
    const resultado = formatarValorDigitado('abc150xyz');
    expect(resultado).toEqual({ display: '1,50', numeric: 1.5 });
  });
});