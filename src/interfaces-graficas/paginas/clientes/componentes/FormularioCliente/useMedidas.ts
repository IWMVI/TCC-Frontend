import { useState, useEffect, useCallback } from 'react';

export interface Medida {
  campo: string;
  label: string;
}

export const MEDIDAS_FEMININAS: Medida[] = [
  { campo: 'cintura', label: 'Cintura' },
  { campo: 'manga', label: 'Manga' },
  { campo: 'alturaBusto', label: 'Altura Busto' },
  { campo: 'raioBusto', label: 'Raio Busto' },
  { campo: 'corpo', label: 'Corpo' },
  { campo: 'ombro', label: 'Ombro' },
  { campo: 'decote', label: 'Decote' },
  { campo: 'quadril', label: 'Quadril' },
  { campo: 'comprimentoVestido', label: 'Comp. Vestido' },
];

export const MEDIDAS_MASCULINAS: Medida[] = [
  { campo: 'cintura', label: 'Cintura' },
  { campo: 'manga', label: 'Manga' },
  { campo: 'colarinho', label: 'Colarinho' },
  { campo: 'barra', label: 'Barra' },
  { campo: 'torax', label: 'Tórax' },
];

export const MEDIDAS_PESSOA_JURIDICA: Medida[] = [
  { campo: 'cintura', label: 'Cintura' },
  { campo: 'manga', label: 'Manga' },
  { campo: 'colarinho', label: 'Colarinho' },
  { campo: 'barra', label: 'Barra' },
  { campo: 'torax', label: 'Tórax' },
  { campo: 'alturaBusto', label: 'Altura Busto' },
  { campo: 'raioBusto', label: 'Raio Busto' },
  { campo: 'corpo', label: 'Corpo' },
  { campo: 'ombro', label: 'Ombro' },
  { campo: 'decote', label: 'Decote' },
  { campo: 'quadril', label: 'Quadril' },
  { campo: 'comprimentoVestido', label: 'Comp. Vestido' },
];

export function useMedidas(
  sexo: 'masculino' | 'feminino',
  initialMedidas?: Record<string, number>,
  isPessoaJuridica: boolean = false
) {
  const [medidas, setMedidas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialMedidas) {
      setMedidas(initialMedidas);
    }
  }, [initialMedidas]);

  const listaMedidas = isPessoaJuridica
    ? MEDIDAS_PESSOA_JURIDICA
    : sexo === 'feminino'
      ? MEDIDAS_FEMININAS
      : MEDIDAS_MASCULINAS;

  const handleMedidaKeyDown = useCallback((campo: string, e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      setMedidas((prev) => {
        const atual = prev[campo] ?? 0;
        const novo = atual * 10 + Number(e.key);
        return novo > 99999 ? prev : { ...prev, [campo]: novo };
      });
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setMedidas((prev) => ({ ...prev, [campo]: Math.floor((prev[campo] ?? 0) / 10) }));
    }
  }, []);

  const temMedidas = Object.values(medidas).some((v) => v > 0);

  return { medidas, setMedidas, listaMedidas, handleMedidaKeyDown, temMedidas };
}
