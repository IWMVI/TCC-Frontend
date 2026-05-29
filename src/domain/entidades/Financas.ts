import { StatusAluguel } from '@/domain/entidades/Aluguel';

export interface FinancasPorStatus {
  status: StatusAluguel;
  quantidade: number;
  valorTotal: number;
}

export interface FinancasResumo {
  dataInicio: string;
  dataFim: string;
  receitaBruta: number;
  totalDescontos: number;
  totalMultas: number;
  receitaLiquida: number;
  quantidadeAlugueis: number;
  porStatus: FinancasPorStatus[];
}
