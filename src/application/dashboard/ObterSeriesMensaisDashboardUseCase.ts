import { SerieMensalDashboard } from '@/domain/entidades/Dashboard';
import { IDashboardRepository } from '@domain/interfaces/IDashboardRepository';

export class ObterSeriesMensaisDashboardUseCase {
  constructor(private readonly repositorio: IDashboardRepository) {}

  async executar(meses = 12): Promise<SerieMensalDashboard[]> {
    return this.repositorio.obterSeriesMensais(meses);
  }
}
