import { useState, useCallback, useEffect } from 'react';
import { TrajeRequest } from '@domain/entidades';

const ESTADO_INICIAL: TrajeRequest = {
  nome: '',
  descricao: '',
  tecido: '',
  cor: '',
  estampa: '',
  tipo: '',
  valorItem: 0,
  tamanho: '',
  textura: '',
  status: '',
  genero: '',
  condicao: '',
  imagemUrl: '',
};

interface UseFormTrajeOptions {
  trajeInicial?: Partial<TrajeRequest>;
  onSubmit?: (dados: TrajeRequest) => Promise<unknown>;
}

interface UseFormTrajeReturn {
  formData: TrajeRequest;
  imagemPreview: string;
  errosValidacao: Partial<Record<keyof TrajeRequest, string>>;
  estaEnviando: boolean;
  setField: (campo: keyof TrajeRequest, valor: string | number) => void;
  setValorItem: (display: string, numeric: number) => void;
  setErro: (campo: keyof TrajeRequest, mensagem: string | undefined) => void;
  setImagemPreview: (url: string) => void;
  limparFormulario: () => void;
  resetarParaInicial: () => void;
}

export function useFormTraje(options: UseFormTrajeOptions = {}): UseFormTrajeReturn {
  const { trajeInicial = {} } = options;

  const [formData, setFormData] = useState<TrajeRequest>(ESTADO_INICIAL);
  const [imagemPreview, setImagemPreviewState] = useState('');
  const [, setValorItemDisplay] = useState('');
  const [errosValidacao, setErrosValidacao] = useState<Partial<Record<keyof TrajeRequest, string>>>({});
  const [estaEnviando, setEstaEnviando] = useState(false);

  useEffect(() => {
    if (Object.keys(trajeInicial).length > 0) {
      const valorInicial = trajeInicial.valorItem || 0;
      setFormData({
        ...ESTADO_INICIAL,
        nome: trajeInicial.nome || '',
        descricao: trajeInicial.descricao || '',
        tecido: trajeInicial.tecido || '',
        cor: trajeInicial.cor || '',
        estampa: trajeInicial.estampa || '',
        tipo: trajeInicial.tipo || '',
        valorItem: valorInicial,
        tamanho: trajeInicial.tamanho || '',
        textura: trajeInicial.textura || '',
        status: trajeInicial.status || '',
        genero: trajeInicial.genero || '',
        condicao: trajeInicial.condicao || '',
        imagemUrl: trajeInicial.imagemUrl || '',
      });
      setValorItemDisplay(formatarValor(valorInicial));
      setImagemPreviewState(trajeInicial.imagemUrl || '');
    }
  }, [trajeInicial]);

  const setField = useCallback((campo: keyof TrajeRequest, valor: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (errosValidacao[campo]) {
      setErrosValidacao((prev) => ({
        ...prev,
        [campo]: undefined,
      }));
    }
  }, [errosValidacao]);

  const setValorItem = useCallback((display: string, numeric: number) => {
    setValorItemDisplay(display);
    setFormData((prev) => ({
      ...prev,
      valorItem: numeric,
    }));

    if (errosValidacao.valorItem) {
      setErrosValidacao((prev) => ({
        ...prev,
        valorItem: undefined,
      }));
    }
  }, [errosValidacao.valorItem]);

  const setErro = useCallback((campo: keyof TrajeRequest, mensagem: string | undefined) => {
    setErrosValidacao((prev) => ({
      ...prev,
      [campo]: mensagem,
    }));
  }, []);

  const limparFormulario = useCallback(() => {
    setFormData(ESTADO_INICIAL);
    setValorItemDisplay('');
    setErrosValidacao({});
    setEstaEnviando(false);
  }, []);

  const resetarParaInicial = useCallback(() => {
    setFormData({
      ...ESTADO_INICIAL,
      nome: trajeInicial.nome || '',
      descricao: trajeInicial.descricao || '',
      tecido: trajeInicial.tecido || '',
      cor: trajeInicial.cor || '',
      estampa: trajeInicial.estampa || '',
      tipo: trajeInicial.tipo || '',
      valorItem: trajeInicial.valorItem || 0,
      tamanho: trajeInicial.tamanho || '',
      textura: trajeInicial.textura || '',
      status: trajeInicial.status || '',
      genero: trajeInicial.genero || '',
      condicao: trajeInicial.condicao || '',
      imagemUrl: trajeInicial.imagemUrl || '',
    });
    setValorItemDisplay(formatarValor(trajeInicial.valorItem || 0));
    setImagemPreviewState(trajeInicial.imagemUrl || '');
    setErrosValidacao({});
  }, [trajeInicial]);

  return {
    formData,
    imagemPreview,
    errosValidacao,
    estaEnviando,
    setField,
    setValorItem,
    setErro,
    setImagemPreview: setImagemPreviewState,
    limparFormulario,
    resetarParaInicial,
  };
}

function formatarValor(valor: number): string {
  if (valor === 0) return '';
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarValorDigitado(value: string): { display: string; numeric: number } {
  const numeros = value.replace(/\D/g, '');
  if (!numeros) return { display: '', numeric: 0 };

  const numeric = parseInt(numeros, 10) / 100;
  const display = numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return { display, numeric };
}
