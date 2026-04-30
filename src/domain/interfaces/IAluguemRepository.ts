import {AluguemRequest, AluguemResponse, AluguemUpdateRequest, StatusAluguel, TipoOcasiao, DevolucaoRequest, DevolucaoResponse} from '../entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export interface FiltrosAluguel {
  status?: StatusAluguel;
  clienteId?: number;
  dataRetiradaInicio?: string;
  dataRetiradaFim?: string;
  ocasiao?: TipoOcasiao;
}

export interface IAluguemRepository {
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<AluguemResponse>>;
  buscarPorId(id: number): Promise<AluguemResponse>;
  criar(dados: AluguemRequest): Promise<AluguemResponse>;
	
	atualizar(id: number, dados: AluguemUpdateRequest): Promise<AluguemResponse>;
  deletar(id: number): Promise<void>;
  marcarComoConcluido(id: number): Promise<AluguemResponse>;
  listarComFiltros(filtros: FiltrosAluguel, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>>;
  registrarDevolucao(aluguelId: number, dados: DevolucaoRequest): Promise<DevolucaoResponse>;
  buscarAtivoByTrajeId(trajeId: number): Promise<AluguemResponse>;
}
