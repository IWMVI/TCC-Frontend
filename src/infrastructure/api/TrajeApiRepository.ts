import axios, { AxiosInstance, isAxiosError } from 'axios';
import { ITrajeRepository } from '@domain/interfaces';
import { TrajeRequest, TrajeResponse } from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';
import { PaginacaoResultado } from './ClienteApiRepository';

const API_BASE_URL = 'http://localhost:8080';

export class TrajeApiRepository implements ITrajeRepository {
  private readonly trajeApi: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.trajeApi = axios.create({
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
  ): Promise<PaginacaoResultado<TrajeResponse>> {
    try {
      const params: Record<string, string | number> = {};
      if (busca) params.busca = busca;
      if (pagina !== undefined) params.pagina = pagina;
      if (tamanho !== undefined) params.tamanho = tamanho;

      const resposta = await this.trajeApi.get<PaginacaoResultado<TrajeResponse>>(
        '/trajes',
        { params }
      );
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar trajes');
    }
  }

  async listarTodos(): Promise<TrajeResponse[]> {
    try {
      const resposta = await this.trajeApi.get<TrajeResponse[]>('/trajes/todos');
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar trajes');
    }
  }

  async buscarPorId(id: number): Promise<TrajeResponse> {
    try {
      const resposta = await this.trajeApi.get<TrajeResponse>(`/trajes/${id}`);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', id);
      }
      throw this.criarErro(error_, 'Erro ao buscar traje');
    }
  }

  async criar(dados: TrajeRequest): Promise<TrajeResponse> {
    try {
      const resposta = await this.trajeApi.post<TrajeResponse>('/trajes', dados);
      return resposta.data;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao criar traje');
    }
  }

  async atualizar(id: number, dados: TrajeRequest): Promise<TrajeResponse> {
    try {
      const resposta = await this.trajeApi.put<TrajeResponse>(`/trajes/${id}`, dados);
      return resposta.data;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', id);
      }
      throw this.criarErro(error_, 'Erro ao atualizar traje');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await this.trajeApi.delete(`/trajes/${id}`);
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', id);
      }
      throw this.criarErro(error_, 'Erro ao deletar traje');
    }
  }

  private criarErro(error_: unknown, mensagemPadrao: string) {
    if (isAxiosError(error_)) {
      if (!error_.response) {
        return new FalhaConexao(mensagemPadrao);
      }
      return new FalhaRequisicao(
        `${mensagemPadrao}: ${error_.response.status} - ${error_.response.statusText}`,
        error_.response.status
      );
    }
    return new FalhaRequisicao(mensagemPadrao);
  }
}