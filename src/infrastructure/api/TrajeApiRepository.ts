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

      const resposta = await this.trajeApi.get<PaginacaoResultado<TrajeResponse>>('/trajes', {
        params,
      });
      return {
        ...resposta.data,
        content: resposta.data.content.map((traje) => this.normalizarResposta(traje)),
      };
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar trajes');
    }
  }

  async listarTodos(): Promise<TrajeResponse[]> {
    try {
      const resposta = await this.trajeApi.get<TrajeResponse[]>('/trajes/todos');
      return resposta.data.map((traje) => this.normalizarResposta(traje));
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao listar trajes');
    }
  }

  async buscarPorId(id: number): Promise<TrajeResponse> {
    try {
      const resposta = await this.trajeApi.get<TrajeResponse>(`/trajes/${id}`);
      return this.normalizarResposta(resposta.data);
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', id);
      }
      throw this.criarErro(error_, 'Erro ao buscar traje');
    }
  }

  async criar(dados: TrajeRequest): Promise<TrajeResponse> {
    try {
      // Transforma 'imagem' em 'imagemUrl' para compatibilidade com o backend
      const dadosAjustados = this.normalizarDados(dados);
      const resposta = await this.trajeApi.post<TrajeResponse>('/trajes', dadosAjustados);
      return this.normalizarResposta(resposta.data);
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao criar traje');
    }
  }

  async atualizar(id: number, dados: TrajeRequest): Promise<TrajeResponse> {
    try {
      // Transforma 'imagem' em 'imagemUrl' para compatibilidade com o backend
      const dadosAjustados = this.normalizarDados(dados);
      const resposta = await this.trajeApi.put<TrajeResponse>(`/trajes/${id}`, dadosAjustados);
      return this.normalizarResposta(resposta.data);
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

  async buscarImagem(trajeId: number): Promise<string | null> {
    try {
      const resposta = await this.trajeApi.get<{ imagemUrl: string }>('/trajes/imagem', {
        params: { trajeId },
      });
      return resposta.data.imagemUrl || null;
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        return null;
      }
      throw this.criarErro(error_, 'Erro ao buscar imagem');
    }
  }

  async atualizarImagem(trajeId: number, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('imagem', file);
      formData.append('trajeId', trajeId.toString());

      const resposta = await this.trajeApi.post<{ imagemUrl: string }>(
        '/trajes/imagem',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return resposta.data.imagemUrl;
    } catch (error_) {
      throw this.criarErro(error_, 'Erro ao atualizar imagem');
    }
  }

  async removerImagem(trajeId: number): Promise<void> {
    try {
      await this.trajeApi.delete('/trajes/imagem', { params: { trajeId } });
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', trajeId);
      }
      throw this.criarErro(error_, 'Erro ao remover imagem');
    }
  }

  private normalizarDados(dados: TrajeRequest): Record<string, unknown> {
    const dadosAjustados = { ...dados } as Record<string, unknown>;

    if (dadosAjustados.imagem && !dadosAjustados.imagemUrl) {
      dadosAjustados.imagemUrl = dadosAjustados.imagem;
      delete dadosAjustados.imagem;
    }

    if (dadosAjustados.preco !== undefined) {
      dadosAjustados.valorItem = dadosAjustados.preco;
      delete dadosAjustados.preco;
    }

    if (dadosAjustados.sexo !== undefined) {
      dadosAjustados.genero = dadosAjustados.sexo;
      delete dadosAjustados.sexo;
    }

    if (dadosAjustados.tipoTraje !== undefined) {
      dadosAjustados.tipo = dadosAjustados.tipoTraje;
      delete dadosAjustados.tipoTraje;
    }

    return dadosAjustados;
  }

  private normalizarResposta(traje: TrajeResponse): TrajeResponse {
    const trajeNormalizado = { ...traje } as Record<string, unknown>;

    if (trajeNormalizado.imagemUrl && !trajeNormalizado.imagem) {
      trajeNormalizado.imagem = trajeNormalizado.imagemUrl;
    }

    if (trajeNormalizado.valorItem !== undefined) {
      trajeNormalizado.preco = Number(trajeNormalizado.valorItem);
    }

    if (trajeNormalizado.genero !== undefined) {
      trajeNormalizado.sexo = String(trajeNormalizado.genero);
    }

    if (trajeNormalizado.tipo !== undefined) {
      trajeNormalizado.tipoTraje = String(trajeNormalizado.tipo);
    }

    return trajeNormalizado as unknown as TrajeResponse;
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
