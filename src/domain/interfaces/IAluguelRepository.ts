import {AluguelRequest, AluguelResponse, AluguelUpdateRequest, StatusAluguel, TipoOcasiao, DevolucaoRequest, DevolucaoResponse} from '@/domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export interface FiltrosAluguel {
  status?: StatusAluguel;
  clienteId?: number;
  nomeCliente?: string;
  dataRetiradaInicio?: string;
  dataRetiradaFim?: string;
  ocasiao?: TipoOcasiao;
}

export interface IAluguelRepository {
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<AluguelResponse>>;
  buscarPorId(id: number): Promise<AluguelResponse>;
  criar(dados: AluguelRequest): Promise<AluguelResponse>;
	
	atualizar(id: number, dados: AluguelUpdateRequest): Promise<AluguelResponse>;
  deletar(id: number): Promise<void>;
  marcarComoConcluido(id: number): Promise<AluguelResponse>;
  listarComFiltros(filtros: FiltrosAluguel, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguelResponse>>;
  registrarDevolucao(aluguelId: number, dados: DevolucaoRequest): Promise<DevolucaoResponse>;
  buscarAtivoByTrajeId(trajeId: number): Promise<AluguelResponse>;
  gerarContratoPdf(id: number): Promise<Blob>;
}
