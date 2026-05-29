import type { EscalaGraficoBarras } from '@/interfaces-graficas/componentes/dashboard/GraficoBarrasMensal/GraficoBarrasMensal';
import type { TomGraficoDashboard } from '@/interfaces-graficas/utils/coresGrafico';
import { formatarMoedaEixoGrafico } from '@/interfaces-graficas/utils/formatarMoedaEixoGrafico';
import { formatarMoedaCompacta } from '@/interfaces-graficas/utils/formatarValorCompacto';

export const GRAFICO_DASHBOARD_TOM: TomGraficoDashboard = 'sobrio';
export const GRAFICO_DASHBOARD_ESCALA: EscalaGraficoBarras = 'monetaria';

export const graficoDashboardMoeda = {
  formatarValor: formatarMoedaCompacta,
  formatarEixo: formatarMoedaEixoGrafico,
  tom: GRAFICO_DASHBOARD_TOM,
  escala: GRAFICO_DASHBOARD_ESCALA,
} as const;
