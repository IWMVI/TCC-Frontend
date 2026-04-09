import { TrajeRequest, TrajeResponse } from '../entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export interface ITrajeRepository {
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<TrajeResponse>>;
  listarTodos(): Promise<TrajeResponse[]>;
  buscarPorId(id: number): Promise<TrajeResponse>;
  criar(dados: TrajeRequest): Promise<TrajeResponse>;
  atualizar(id: number, dados: TrajeRequest): Promise<TrajeResponse>;
  deletar(id: number): Promise<void>;
  atualizarImagem(trajeId: number, file: File): Promise<string>;
  removerImagem(trajeId: number): Promise<void>;
}