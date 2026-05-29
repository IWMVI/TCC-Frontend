import { formatarMoedaCompacta } from '@/interfaces-graficas/utils/formatarValorCompacto';

export function formatarMoedaEixoGrafico(valor: number): string {
  if (valor <= 0) {
    return '0';
  }

  return formatarMoedaCompacta(valor);
}
