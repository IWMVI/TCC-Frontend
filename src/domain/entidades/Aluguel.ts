import { ClienteResponse } from '@/domain/entidades/Cliente';

export enum StatusAluguel {
  ATIVO = 'Ativo',
  ATRASO = 'Em Atraso',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado',
}

export enum TipoOcasiao {
  CASAMENTO = 'CASAMENTO',
  FORMATURA = 'FORMATURA',
  BAILE_DE_GALA = 'BAILE_DE_GALA',
  FESTA_FORMAL = 'FESTA_FORMAL',
  EVENTO_CORPORATIVO = 'EVENTO_CORPORATIVO',
  JANTAR_FORMAL = 'JANTAR_FORMAL',
  CERIMONIA = 'CERIMONIA',
}

export interface AluguelItem {
  trajeId: number;
  nomeTraje: string;
  tipo?: string;
  tamanho?: string;
  cor?: string;
  valorItem?: number;
}

export interface Aluguel {
  id?: number;
  clienteId: number;
  nomeCliente: string;
  dataAluguel: string;
  dataRetirada: string;
  dataDevolucao: string;
  status: StatusAluguel;
  valorDesconto: number;
  valorTotal: number;
  observacoes?: string;
  ocasiao: TipoOcasiao;
  itens?: AluguelItem[];
}

export interface AluguelRequest {
  clienteId: number;
  dataRetirada: string;
  dataDevolucao: string;
  observacoes?: string;
  ocasiao: TipoOcasiao;
  valorDesconto?: number;
  itens: AluguelItemRequest[];
}

export interface AluguelUpdateRequest {
  dataRetirada: string;
  dataDevolucao: string;
  observacoes?: string;
  ocasiao: TipoOcasiao;
  valorDesconto?: number;
  status: StatusAluguel;
  itens: AluguelItemRequest[];
}

export interface AluguelItemRequest {
  trajeId: number;
}

export interface AluguelResponse {
  id: number;
  clienteId: number;
  nomeCliente: string;
  dataAluguel: string;
  dataRetirada: string;
  dataDevolucao: string;
  status: StatusAluguel;
  valorDesconto: number;
  valorMulta: number;
  valorTotal: number;
  observacoes?: string;
  ocasiao: TipoOcasiao;
  itens: AluguelItem[];
  cliente?: ClienteResponse;
}
