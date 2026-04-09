import { useCallback, useState } from 'react';

interface UseImageHandlerReturn {
  imagemPreview: string;
  estaCarregando: boolean;
  erro: string | null;
  handleFileChange: (file: File | undefined) => void;
  handleRemover: () => void;
  setImagemPreview: (url: string) => void;
  clearErro: () => void;
}

export function useImageHandler(): UseImageHandlerReturn {
  const [imagemPreview, setImagemPreview] = useState('');
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleFileChange = useCallback((file: File | undefined) => {
    if (!file) return;

    setEstaCarregando(true);
    setErro(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagemPreview(base64);
      setEstaCarregando(false);
    };
    reader.onerror = () => {
      setErro('Erro ao carregar imagem');
      setEstaCarregando(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemover = useCallback(() => {
    setImagemPreview('');
    setErro(null);
  }, []);

  const clearErro = useCallback(() => {
    setErro(null);
  }, []);

  return {
    imagemPreview,
    estaCarregando,
    erro,
    handleFileChange,
    handleRemover,
    setImagemPreview,
    clearErro,
  };
}
