import { renderHook, act } from '@testing-library/react';
import { useMedidas, MEDIDAS_FEMININAS, MEDIDAS_MASCULINAS, MEDIDAS_PESSOA_JURIDICA } from './useMedidas';

function criarEventoTecla(key: string): React.KeyboardEvent<HTMLElement> {
  return { key, preventDefault: jest.fn() } as unknown as React.KeyboardEvent<HTMLElement>;
}

describe('useMedidas', () => {
  it('deve retornar MEDIDAS_FEMININAS quando sexo for feminino', () => {
    const { result } = renderHook(() => useMedidas('feminino'));

    expect(result.current.listaMedidas).toBe(MEDIDAS_FEMININAS);
  });

  it('deve retornar MEDIDAS_MASCULINAS quando sexo for masculino', () => {
    const { result } = renderHook(() => useMedidas('masculino'));

    expect(result.current.listaMedidas).toBe(MEDIDAS_MASCULINAS);
  });

  it('deve retornar MEDIDAS_PESSOA_JURIDICA quando isPessoaJuridica for true', () => {
    const { result } = renderHook(() => useMedidas('masculino', undefined, true));

    expect(result.current.listaMedidas).toBe(MEDIDAS_PESSOA_JURIDICA);
  });

  it('deve inicializar medidas com initialMedidas quando fornecido', () => {
    const initialMedidas = { cintura: 80, manga: 60 };
    const { result } = renderHook(() => useMedidas('feminino', initialMedidas));

    expect(result.current.medidas).toEqual(initialMedidas);
  });

  it('deve adicionar medida quando handleMedidaKeyDown receber número', () => {
    const { result } = renderHook(() => useMedidas('feminino'));

    act(() => {
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('8'));
    });

    expect(result.current.medidas).toEqual({ cintura: 8 });
  });

  it('deve acumular dígitos quando handleMedidaKeyDown receber múltiplos números', () => {
    const { result } = renderHook(() => useMedidas('feminino'));

    act(() => {
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('8'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('0'));
    });

    expect(result.current.medidas).toEqual({ cintura: 80 });
  });

  it('deve remover último dígito quando handleMedidaKeyDown receber Backspace', () => {
    const { result } = renderHook(() => useMedidas('feminino', { cintura: 80 }));

    act(() => {
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('Backspace'));
    });

    expect(result.current.medidas).toEqual({ cintura: 8 });
  });

  it('deve limitar valor máximo a 99999', () => {
    const { result } = renderHook(() => useMedidas('feminino'));

    act(() => {
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
      result.current.handleMedidaKeyDown('cintura', criarEventoTecla('9'));
    });

    expect(result.current.medidas.cintura).toBe(99999);
  });

  it('deve definir temMedidas como true quando alguma medida for maior que zero', () => {
    const { result } = renderHook(() => useMedidas('feminino', { cintura: 80 }));

    expect(result.current.temMedidas).toBe(true);
  });

  it('deve definir temMedidas como false quando todas as medidas forem zero', () => {
    const { result } = renderHook(() => useMedidas('feminino'));

    expect(result.current.temMedidas).toBe(false);
  });

  it('deve definir temMedidas como false quando medidas for vazio', () => {
    const { result } = renderHook(() => useMedidas('feminino', {}));

    expect(result.current.temMedidas).toBe(false);
  });
});
