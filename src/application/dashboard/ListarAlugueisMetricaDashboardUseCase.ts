import { AluguelResponse } from '@/domain/entidades';
import { TipoMetricaDashboard } from '@/domain/entidades/MetricaDashboard';
import { IDashboardRepository } from '@domain/interfaces/IDashboardRepository';

export class ListarAlugueisMetricaDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async executar(tipo: TipoMetricaDashboard): Promise<AluguelResponse[]> {
    return this.dashboardRepository.listarAlugueisPorMetrica(tipo);
  }
}
