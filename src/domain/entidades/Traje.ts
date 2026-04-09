export interface Traje {
  id?: number;
  codigo: string;
  nome: string;
  descricao: string;
  tecido: string;
  cor: string;
  estampa?: string;
  tipo: string;
  preco?: number;
  valorItem?: number;
  tamanho: string;
  textura: string;
  status: string;
  genero: string;
  condicao: string;
  imagem?: string;
  imagemUrl?: string;
  dataCadastro?: string;
}

export interface TrajeRequest {
  nome: string;
  descricao: string;
  tecido: string;
  cor: string;
  estampa?: string;
  tipo: string;
  valorItem: number;
  tamanho: string;
  textura: string;
  status: string;
  genero: string;
  condicao: string;
  imagemUrl?: string;
}

export interface TrajeResponse {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  tecido: string;
  cor: string;
  estampa?: string;
  tipo: string;
  preco: number;
  valorItem?: number;
  tamanho: string;
  textura: string;
  status: string;
  genero: string;
  condicao: string;
  imagem?: string;
  imagemUrl?: string;
  dataCadastro: string;
}
