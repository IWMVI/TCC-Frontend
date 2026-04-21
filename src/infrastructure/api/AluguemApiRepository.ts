import axios, { AxiosInstance, isAxiosError } from 'axios';
import { IAluguemRepository } from '@domain/interfaces';
import {AluguemRequest, AluguemResponse, AluguemUpdateRequest} from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';
import { PaginacaoResultado } from './ClienteApiRepository';

const API_BASE_URL = 'http://localhost:8080';

export class AluguemApiRepository implements IAluguemRepository {
  private readonly aluguelApi: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.aluguelApi = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async listar(
    busca?: string,
    pagina: number = 0,
    tamanho: number = 10,
  ): Promise<PaginacaoResultado<AluguemResponse>> {
    try {
		const resposta = await this.aluguelApi.get<AluguemResponse[]>('/alugueis');
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

  async buscarPorId(id: number): Promise<AluguemResponse> {
    try {
      const resposta = await this.aluguelApi.get<AluguemResponse>(`/alugueis/${id}`);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao buscar aluguel');
    }
  }

  async criar(dados: AluguemRequest): Promise<AluguemResponse> {
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
		
		const resposta = await this.aluguelApi.post<AluguemResponse>('/alugueis', payload);
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao criar aluguel');
    }
  }
	
	async atualizar(id: number, dados: AluguemUpdateRequest): Promise<AluguemResponse> {
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
		
		const resposta = await this.aluguelApi.put<AluguemResponse>(`/alugueis/${id}`, payload);
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

  async marcarComoConcluido(id: number): Promise<AluguemResponse> {
    try {
		const resposta = await this.aluguelApi.put<AluguemResponse>(`/alugueis/${id}/concluir`);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Aluguel', id);
      }
      throw this.criarErro(error_, 'Erro ao marcar aluguel como concluído');
    }
  }

  private criarErro(error: unknown, mensagemPadrao: string): Error {
    if (isAxiosError(error)) {
      if (!error.response) {
		  return new FalhaConexao(error.message || 'Não foi possível conectar ao servidor');
      }

      const dados = error.response.data as Record<string, any>;
		const mensagem = dados?.message || dados?.erro || mensagemPadrao;
		return new FalhaRequisicao(mensagem, error.response.status);
    }
	  
	  return error instanceof Error ? error : new Error(mensagemPadrao);
  }
}
