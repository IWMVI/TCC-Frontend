import { IFinancasRepository } from '@domain/interfaces/IFinancasRepository';
import { FinancasResumo } from '@/domain/entidades/Financas';
import { httpClient } from '@/infrastructure/api/httpClient';
import { tratarErroApi } from '@/infrastructure/api/apiErrorHandler';

export class FinancasApiRepository implements IFinancasRepository {
  async obterResumo(dataInicio?: string, dataFim?: string): Promise<FinancasResumo> {
    try {
      const params: Record<string, string> = {};
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;

      const resposta = await httpClient.get<FinancasResumo>('/financas/resumo', {
        params,
      });
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }
}
