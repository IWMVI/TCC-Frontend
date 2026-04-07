export interface Traje {
  id?: number;
  nome: string;
  descricao: string;
  tamanho: string;
  cor: string;
  preco: number;
  dataCadastro?: string;
}

export interface TrajeRequest {
  nome: string;
  descricao: string;
  tamanho: string;
  cor: string;
  preco: number;
}

export interface TrajeResponse {
  id: number;
  nome: string;
  descricao: string;
  tamanho: string;
  cor: string;
  preco: number;
  dataCadastro: string;
}