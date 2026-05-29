import { AxiosInstance, isAxiosError } from 'axios';
import { IAluguelRepository, FiltrosAluguel } from '@domain/interfaces';
import {AluguelRequest, AluguelResponse, AluguelUpdateRequest, DevolucaoRequest, DevolucaoResponse} from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';
import { PaginacaoResultado } from '@/infrastructure/api/ClienteApiRepository';
import { httpClient } from '@/infrastructure/api/httpClient';

export class AluguelApiRepository implements IAluguelRepository {
  private readonly aluguelApi: AxiosInstance;

  constructor(aluguelApi: AxiosInstance = httpClient) {
    this.aluguelApi = aluguelApi;
  }

  async listar(
    busca?: string,
    pagina: number = 0,
    tamanho: number = 10,
  ): Promise<PaginacaoResultado<AluguelResponse>> {
    try {
		const resposta = await this.aluguelApi.get<AluguelResponse[]>('/alugueis');
		const termoBusca = busca?.trim().toLowerCase();
		
		const filtrados = termoBusca
			? resposta.data.filter((aluguel) => {
				const idMatch = String(aluguel.id).includes(termoBusca);
				const nomeMatch = aluguel.nomeCliente?.toLowerCase().includes(termoBusca);
				return idMatch || nomeMatch;
			})
			: resposta.data;
		
		const inicio = pagina * tamanho;
		const fim = inicio + tamanho;
		const content = filtrados.slice(inicio, fim);
		const totalElements = filtrados.length;
		const totalPages = Math.ceil(totalElements / tamanho);
		
		return {
			content,
			totalElements,
			totalPages,
			size: tamanho,
			number: pagina,
			first: pagina === 0,
			last: pagina >= Math.max(totalPages - 1, 0),
		};
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar aluguéis');
    }
  }

  async buscarPorId(id: number): Promise<AluguelResponse> {
    try {
      const resposta = await this.aluguelApi.get<AluguelResponse>(`/alugueis/${id}`);
      return this.normalizarResposta(resposta.data);
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao buscar aluguel');
    }
  }

  async criar(dados: AluguelRequest): Promise<AluguelResponse> {
    try {
		const payload = {
			clienteId: dados.clienteId,
			dataRetirada: dados.dataRetirada,
			dataDevolucao: dados.dataDevolucao,
			valorDesconto: dados.valorDesconto,
			observacoes: dados.observacoes || null,
			ocasiao: dados.ocasiao,
			itens: dados.itens,
		};
		
		const resposta = await this.aluguelApi.post<AluguelResponse>('/alugueis', payload);
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao criar aluguel');
    }
  }
	
	async atualizar(id: number, dados: AluguelUpdateRequest): Promise<AluguelResponse> {
    try {
		const payload = {
			dataRetirada: dados.dataRetirada,
			dataDevolucao: dados.dataDevolucao,
			valorDesconto: dados.valorDesconto,
			observacoes: dados.observacoes || null,
			status: dados.status,
			ocasiao: dados.ocasiao,
			itens: dados.itens,
		};
		
		const resposta = await this.aluguelApi.put<AluguelResponse>(`/alugueis/${id}`, payload);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao atualizar aluguel');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await this.aluguelApi.delete(`/alugueis/${id}`);
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao deletar aluguel');
    }
  }

  async marcarComoConcluido(id: number): Promise<AluguelResponse> {
    try {
		const resposta = await this.aluguelApi.put<AluguelResponse>(`/alugueis/${id}/concluir`);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao marcar aluguel como concluído');
    }
  }

  async listarComFiltros(
    filtros: FiltrosAluguel,
    pagina: number = 0,
    tamanho: number = 10,
  ): Promise<PaginacaoResultado<AluguelResponse>> {
    try {
      const params: Record<string, string | number> = {};

      if (filtros.status != null) params['status'] = filtros.status;
      if (filtros.clienteId != null) params['clienteId'] = filtros.clienteId;
      if (filtros.nomeCliente != null) params['nomeCliente'] = filtros.nomeCliente;
      if (filtros.dataRetiradaInicio != null) params['dataRetiradaInicio'] = filtros.dataRetiradaInicio;
      if (filtros.dataRetiradaFim != null) params['dataRetiradaFim'] = filtros.dataRetiradaFim;
      if (filtros.ocasiao != null) params['ocasiao'] = filtros.ocasiao;

      const resposta = await this.aluguelApi.get<AluguelResponse[]>('/alugueis', { params });

      const inicio = pagina * tamanho;
      const fim = inicio + tamanho;
      const content = resposta.data.slice(inicio, fim);
      const totalElements = resposta.data.length;
      const totalPages = Math.ceil(totalElements / tamanho);

      return {
        content,
        totalElements,
        totalPages,
        size: tamanho,
        number: pagina,
        first: pagina === 0,
        last: pagina >= Math.max(totalPages - 1, 0),
      };
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar aluguéis com filtros');
    }
  }

  async registrarDevolucao(aluguelId: number, dados: DevolucaoRequest): Promise<DevolucaoResponse> {
    try {
      const resposta = await this.aluguelApi.post<DevolucaoResponse>(
        `/alugueis/${aluguelId}/devolucao`,
        dados,
      );
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', aluguelId);
      }
      throw this.criarErro(error_, 'Erro ao registrar devolução');
    }
  }

  async buscarAtivoByTrajeId(trajeId: number): Promise<AluguelResponse> {
    try {
      const resposta = await this.aluguelApi.get<AluguelResponse>(`/alugueis/traje/${trajeId}/ativo`);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel ativo para o traje', trajeId);
      }
      throw this.criarErro(error_, 'Erro ao buscar aluguel ativo do traje');
    }
  }

  async gerarContratoPdf(id: number): Promise<Blob> {
    try {
      const resposta = await this.aluguelApi.get<Blob>(
        `/alugueis/${id}/contrato`,
        { responseType: 'blob' },
      );
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao gerar contrato');
    }
  }

  private normalizarResposta(aluguel: AluguelResponse): AluguelResponse {
    return {
      ...aluguel,
      valorTotal: Number(aluguel.valorTotal),
      valorDesconto: Number(aluguel.valorDesconto ?? 0),
      valorMulta: Number(aluguel.valorMulta ?? 0),
      itens:
        aluguel.itens?.map((item) => ({
          ...item,
          valorItem: item.valorItem != null ? Number(item.valorItem) : undefined,
        })) ?? [],
    };
  }

  private criarErro(error: unknown, mensagemPadrao: string): Error {
    if (isAxiosError(error)) {
      if (!error.response) {
		  return new FalhaConexao(error.message || 'Não foi possível conectar ao servidor');
      }

      const dados = error.response.data as Record<string, unknown>;
		const mensagem = (dados?.message as string) || (dados?.erro as string) || mensagemPadrao;
		return new FalhaRequisicao(mensagem, error.response.status);
    }
	  
	  return error instanceof Error ? error : new Error(mensagemPadrao);
  }
}
