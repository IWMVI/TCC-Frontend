import { StatusAluguel } from '@/domain/entidades/Aluguel';

export interface AluguelResumoItem {
  id: number;
  nomeCliente: string;
  dataAluguel: string;
  status: StatusAluguel;
  valorTotal: number;
}

export interface DashboardResumo {
  alugueisAtivos: number;
  alugueisEmAtraso: number;
  alugueisConcluidos: number;
  alugueisCancelados: number;
  receitaMesAtual: number;
  receitaPendente: number;
  totalDescontos: number;
  totalMultas: number;
  ultimosAlugueis: AluguelResumoItem[];
}

export interface SerieMensalDashboard {
  mes: string;
  receita: number;
  quantidadeAlugueis: number;
  multas: number;
  descontos: number;
}
