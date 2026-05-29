import { IDashboardRepository } from '@domain/interfaces/IDashboardRepository';
import { AluguelResponse } from '@/domain/entidades';
import { DashboardResumo, SerieMensalDashboard } from '@/domain/entidades/Dashboard';
import { TipoMetricaDashboard } from '@/domain/entidades/MetricaDashboard';
import { httpClient } from '@/infrastructure/api/httpClient';
import { tratarErroApi } from '@/infrastructure/api/apiErrorHandler';

export class DashboardApiRepository implements IDashboardRepository {
  async obterResumo(): Promise<DashboardResumo> {
    try {
      const resposta = await httpClient.get<DashboardResumo>('/dashboard/resumo');
      return {
        ...resposta.data,
        ultimosAlugueis: resposta.data.ultimosAlugueis.map((item) => ({
          ...item,
          valorTotal: Number(item.valorTotal ?? 0),
        })),
      };
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async obterSeriesMensais(meses = 12): Promise<SerieMensalDashboard[]> {
    try {
      const resposta = await httpClient.get<SerieMensalDashboard[]>('/dashboard/series-mensais', {
        params: { meses },
      });
      return resposta.data;
    } catch (erro) {
      throw new Error('Erro ao carregar séries mensais do dashboard', { cause: erro });
    }
  }

  async listarAlugueisPorMetrica(tipo: TipoMetricaDashboard): Promise<AluguelResponse[]> {
    try {
      const resposta = await httpClient.get<AluguelResponse[]>(`/dashboard/metricas/${tipo}/alugueis`);
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }
}
