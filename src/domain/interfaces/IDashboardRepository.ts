import { DashboardResumo, SerieMensalDashboard } from '@/domain/entidades/Dashboard';
import { TipoMetricaDashboard } from '@/domain/entidades/MetricaDashboard';
import { AluguelResponse } from '@/domain/entidades';

export interface IDashboardRepository {
  obterResumo(): Promise<DashboardResumo>;
  obterSeriesMensais(meses?: number): Promise<SerieMensalDashboard[]>;
  listarAlugueisPorMetrica(tipo: TipoMetricaDashboard): Promise<AluguelResponse[]>;
}
