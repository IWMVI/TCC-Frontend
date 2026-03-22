import axios, { AxiosInstance, AxiosError } from 'axios';
import { IClienteRepositorio } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse } from '../../domain/entidades';
import { FalhaRequisicao, RecursoNaoEncontrado, FalhaConexao } from '../../domain/erros';

const API_BASE_URL = 'http://localhost:8080';

export class ClienteApiRepositorio implements IClienteRepositorio {
  private readonly clienteApi: AxiosInstance;

  constructor(baseUrl: string = API_BASE_URL) {
    this.clienteApi = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async listar(busca?: string): Promise<ClienteResponse[]> {
    try {
      const params = busca ? { busca } : undefined;
      const resposta = await this.clienteApi.get<ClienteResponse[]>('/clientes', { params });
      return resposta.data;
    } catch (erro) {
      this.tratarErro(erro, 'Erro ao listar clientes');
    }
  }

  async buscarPorId(id: number): Promise<ClienteResponse> {
    try {
      const resposta = await this.clienteApi.get<ClienteResponse>(`/clientes/${id}`);
      return resposta.data;
    } catch (erro) {
      if (erro instanceof AxiosError && erro.response?.status === 404) {
        throw new RecursoNaoEncontrado('Cliente', id);
      }
      this.tratarErro(erro, 'Erro ao buscar cliente');
    }
  }

  async criar(dados: ClienteRequest): Promise<ClienteResponse> {
    try {
      const resposta = await this.clienteApi.post<ClienteResponse>('/clientes', dados);
      return resposta.data;
    } catch (erro) {
      this.tratarErro(erro, 'Erro ao criar cliente');
    }
  }

  async atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse> {
    try {
      const resposta = await this.clienteApi.put<ClienteResponse>(`/clientes/${id}`, dados);
      return resposta.data;
    } catch (erro) {
      if (erro instanceof AxiosError && erro.response?.status === 404) {
        throw new RecursoNaoEncontrado('Cliente', id);
      }
      this.tratarErro(erro, 'Erro ao atualizar cliente');
    }
  }

  async deletar(id: number): Promise<void> {
    try {
      await this.clienteApi.delete(`/clientes/${id}`);
    } catch (erro) {
      if (erro instanceof AxiosError && erro.response?.status === 404) {
        throw new RecursoNaoEncontrado('Cliente', id);
      }
      this.tratarErro(erro, 'Erro ao deletar cliente');
    }
  }

  private tratarErro(erro: unknown, mensagemPadrao: string): never {
    if (erro instanceof AxiosError) {
      if (!erro.response) {
        throw new FalhaConexao();
      }
      const detalhes = erro.response.data?.message || erro.message;
      throw new FalhaRequisicao(`${mensagemPadrao}: ${detalhes}`, erro.response.status);
    }
    throw new FalhaRequisicao(mensagemPadrao);
  }
}
