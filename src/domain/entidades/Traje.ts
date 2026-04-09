export interface Traje {
  id?: number;
  codigo: string;
  nome: string;
  descricao: string;
  tecido: string;
  cor: string;
  estampa?: string;
  tipoTraje: string;
  preco?: number;
  valorItem?: number;
  tamanho: string;
  textura: string;
  status: string;
  sexo: string;
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
  tipoTraje: string;
  preco: number;
  tamanho: string;
  textura: string;
  status: string;
  sexo: string;
  condicao: string;
  imagem?: string;
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
  tipoTraje: string;
  preco: number;
  valorItem?: number;
  tamanho: string;
  textura: string;
  status: string;
  sexo: string;
  condicao: string;
  imagem?: string;
  imagemUrl?: string;
  dataCadastro: string;
}
