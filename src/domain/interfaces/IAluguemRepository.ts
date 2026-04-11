import { AluguemRequest, AluguemResponse } from '../entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export interface IAluguemRepository {
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<AluguemResponse>>;
  buscarPorId(id: number): Promise<AluguemResponse>;
  criar(dados: AluguemRequest): Promise<AluguemResponse>;
  atualizar(id: number, dados: AluguemRequest): Promise<AluguemResponse>;
  deletar(id: number): Promise<void>;
  marcarComoConcluido(id: number): Promise<AluguemResponse>;
}
