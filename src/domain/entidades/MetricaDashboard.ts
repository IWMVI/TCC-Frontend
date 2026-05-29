export type TipoMetricaDashboard =
  | 'alugueis-ativos'
  | 'em-atraso'
  | 'receita-mes'
  | 'receita-pendente'
  | 'multas'
  | 'descontos';

export interface ConfigMetricaDashboard {
  tipo: TipoMetricaDashboard;
  titulo: string;
  descricao: string;
  rota: string;
}

export const METRICAS_DASHBOARD: ConfigMetricaDashboard[] = [
  {
    tipo: 'alugueis-ativos',
    titulo: 'Aluguéis ativos',
    descricao: 'Contratos em andamento com prazo de devolução vigente.',
    rota: '/dashboard/alugueis-ativos',
  },
  {
    tipo: 'em-atraso',
    titulo: 'Em atraso',
    descricao: 'Aluguéis com devolução em atraso.',
    rota: '/dashboard/em-atraso',
  },
  {
    tipo: 'receita-mes',
    titulo: 'Receita do mês',
    descricao: 'Aluguéis concluídos no mês atual.',
    rota: '/dashboard/receita-mes',
  },
  {
    tipo: 'receita-pendente',
    titulo: 'Receita pendente',
    descricao: 'Aluguéis ativos e em atraso com valor a receber.',
    rota: '/dashboard/receita-pendente',
  },
  {
    tipo: 'multas',
    titulo: 'Multas (total)',
    descricao: 'Aluguéis com multa aplicada.',
    rota: '/dashboard/multas',
  },
  {
    tipo: 'descontos',
    titulo: 'Descontos (total)',
    descricao: 'Aluguéis com desconto concedido.',
    rota: '/dashboard/descontos',
  },
];

export function obterConfigMetrica(tipo: string): ConfigMetricaDashboard | undefined {
  return METRICAS_DASHBOARD.find((metrica) => metrica.tipo === tipo);
}

export function tipoMetricaValido(tipo: string): tipo is TipoMetricaDashboard {
  return METRICAS_DASHBOARD.some((metrica) => metrica.tipo === tipo);
}
