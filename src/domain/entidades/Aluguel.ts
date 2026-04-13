import { ClienteResponse } from './Cliente';
import { Traje } from './Traje';

export enum StatusAluguel {
  ATIVO = 'ATIVO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export interface AluguemItem {
  id?: number;
  trajeId: number;
  traje?: Traje;
  tamanho: string;
  dataRetirada?: string;
  dataDevolucao?: string;
}

export interface Aluguel {
  id?: number;
  clienteId: number;
  cliente?: ClienteResponse;
  dataRetirada: string;
  dataDevolucao: string;
  status: StatusAluguel;
  desconto: number;
  subtotal: number;
  total: number;
  dataCadastro?: string;
  itens?: AluguemItem[];
}

export interface AluguemRequest {
  clienteId: number;
  dataRetirada: string;
  dataDevolucao: string;
  desconto: number;
  itens: AluguemItemRequest[];
}

export interface AluguemItemRequest {
  trajeId: number;
  tamanho: string;
}

export interface AluguemResponse {
  id: number;
  clienteId: number;
  cliente: ClienteResponse;
  dataRetirada: string;
  dataDevolucao: string;
  status: StatusAluguel;
  desconto: number;
  subtotal: number;
  total: number;
  dataCadastro: string;
  itens: AluguemItem[];
}
