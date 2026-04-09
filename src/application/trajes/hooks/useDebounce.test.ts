import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from './useDebounce';

describe('useDebounce', () => {
  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('valor inicial'));

    expect(result.current.value).toBe('valor inicial');
    expect(result.current.debouncedValue).toBe('valor inicial');
  });

  it('deve setValue atualizar o valor diretamente', () => {
    const { result } = renderHook(() => useDebounce('valor inicial'));

    act(() => {
      result.current.setValue('novo valor');
    });

    expect(result.current.value).toBe('novo valor');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve chamar o callback após o delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current();
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('deve limpar o timeout anterior ao chamar novamente', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 100));

    act(() => {
      result.current();
    });

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});