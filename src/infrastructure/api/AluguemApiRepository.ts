import axios, { AxiosInstance, isAxiosError } from 'axios';
import { IAluguemRepository } from '@domain/interfaces';
import {
  AluguemRequest,
  AluguemResponse,
} from '@domain/entidades';
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
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<AluguemResponse>> {
    try {
      const params: Record<string, string | number> = {};
      if (busca) params.busca = busca;
      if (pagina !== undefined) params.pagina = pagina;
      if (tamanho !== undefined) params.tamanho = tamanho;

      const resposta = await this.aluguelApi.get<PaginacaoResultado<AluguemResponse>>(
        '/alugueis',
        { params }
      );
      return resposta.data;
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
      const resposta = await this.aluguelApi.post<AluguemResponse>('/alugueis', dados);
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao criar aluguel');
    }
  }

  async atualizar(id: number, dados: AluguemRequest): Promise<AluguemResponse> {
    try {
      const resposta = await this.aluguelApi.put<AluguemResponse>(`/alugueis/${id}`, dados);
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
      const resposta = await this.aluguelApi.put<AluguemResponse>(
        `/alugueis/${id}/concluir`
      );
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
        return new FalhaConexao(
          error.message || 'Não foi possível conectar ao servidor'
        );
      }
      const dados = error.response.data as Record<string, any>;
      const mensagem =
        dados?.message || dados?.erro || mensagemPadrao;
      return new FalhaRequisicao(
        mensagem,
        error.response.status
      );
    }
    return error instanceof Error ? error : new Error(mensagemPadrao);
  }
}
