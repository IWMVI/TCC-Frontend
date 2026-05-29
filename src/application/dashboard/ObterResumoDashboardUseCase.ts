import { IDashboardRepository } from '@domain/interfaces/IDashboardRepository';
import { DashboardResumo } from '@/domain/entidades/Dashboard';

export class ObterResumoDashboardUseCase {
  constructor(private readonly repositorio: IDashboardRepository) {}

  async executar(): Promise<DashboardResumo> {
    return this.repositorio.obterResumo();
  }
}
