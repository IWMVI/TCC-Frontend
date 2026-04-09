import { renderHook, act } from '@testing-library/react';
import { useImageHandler } from './useImageHandler';

describe('useImageHandler', () => {
  it('deve retornar valores iniciais corretos', () => {
    const { result } = renderHook(() => useImageHandler());

    expect(result.current.imagemPreview).toBe('');
    expect(result.current.estaCarregando).toBe(false);
    expect(result.current.erro).toBe(null);
  });

  it('deve atualizar a imagemPreview quando um arquivo válido for selecionado', async () => {
    const { result } = renderHook(() => useImageHandler());

    const file = new File(['conteudo da imagem'], 'imagem.jpg', { type: 'image/jpeg' });
    
    act(() => {
      result.current.handleFileChange(file);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.imagemPreview).toContain('data:image/jpeg;base64');
  });

  it('deve não fazer nada quando arquivo for undefined', () => {
    const { result } = renderHook(() => useImageHandler());

    act(() => {
      result.current.handleFileChange(undefined as unknown as File);
    });

    expect(result.current.imagemPreview).toBe('');
  });

  it('deve definir erro quando FileReader falhar', async () => {
    const { result } = renderHook(() => useImageHandler());

    const mockFile = new File([''], 'imagem.jpg', { type: 'image/jpeg' });
    
    const originalReadAsDataURL = FileReader.prototype.readAsDataURL;
    jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function(this: FileReader) {
      setTimeout(() => {
        if (this.onerror) {
          this.onerror(new Event('error'));
        }
      }, 0);
    });

    act(() => {
      result.current.handleFileChange(mockFile);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.erro).toBe('Erro ao carregar imagem');

    FileReader.prototype.readAsDataURL = originalReadAsDataURL;
  });

  it('deve limpar a imagem ao chamar handleRemover', () => {
    const { result } = renderHook(() => useImageHandler());

    act(() => {
      result.current.setImagemPreview('data:image/png;base64,abc123');
    });

    act(() => {
      result.current.handleRemover();
    });

    expect(result.current.imagemPreview).toBe('');
    expect(result.current.erro).toBe(null);
  });

  it('deve limpar o erro ao chamar clearErro', () => {
    const { result } = renderHook(() => useImageHandler());

    act(() => {
      result.current.handleFileChange(new File([''], 'test.jpg', { type: 'image/jpeg' }));
    });

    act(() => {
      result.current.clearErro();
    });

    expect(result.current.erro).toBe(null);
  });

  it('deve definir imagemPreview via setImagemPreview', () => {
    const { result } = renderHook(() => useImageHandler());

    act(() => {
      result.current.setImagemPreview('http://exemplo.com/imagem.jpg');
    });

    expect(result.current.imagemPreview).toBe('http://exemplo.com/imagem.jpg');
  });
});