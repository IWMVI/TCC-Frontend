import { IFinancasRepository } from '@domain/interfaces/IFinancasRepository';
import { FinancasResumo } from '@/domain/entidades/Financas';

export class ObterResumoFinancasUseCase {
  constructor(private readonly repositorio: IFinancasRepository) {}

  async executar(dataInicio?: string, dataFim?: string): Promise<FinancasResumo> {
    return this.repositorio.obterResumo(dataInicio, dataFim);
  }
}
