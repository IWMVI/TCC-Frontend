import { FinancasResumo } from '@/domain/entidades/Financas';

export interface IFinancasRepository {
  obterResumo(dataInicio?: string, dataFim?: string): Promise<FinancasResumo>;
}
