import { ClienteResponse } from './Cliente';

export enum StatusAluguel {
  ATIVO = 'Ativo',
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

export interface AluguemItem {
  trajeId: number;
	nomeTraje: string;
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
  itens?: AluguemItem[];
}

export interface AluguemRequest {
  clienteId: number;
  dataRetirada: string;
  dataDevolucao: string;
	observacoes?: string;
	ocasiao: TipoOcasiao;
	valorDesconto?: number;
  itens: AluguemItemRequest[];
}

export interface AluguemUpdateRequest {
	dataRetirada: string;
	dataDevolucao: string;
	observacoes?: string;
	ocasiao: TipoOcasiao;
	valorDesconto?: number;
	status: StatusAluguel;
	itens: AluguemItemRequest[];
}

export interface AluguemItemRequest {
  trajeId: number;
}

export interface AluguemResponse {
  id: number;
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
  itens: AluguemItem[];
	cliente?: ClienteResponse;
}
