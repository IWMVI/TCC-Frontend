import { AxiosInstance, isAxiosError } from 'axios';
import { ITrajeRepository } from '@domain/interfaces';
import { PeriodoAlugado, TrajeRequest, TrajeResponse } from '@domain/entidades';
import { normalizarDataIso } from '@domain/utils/dataIso';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';
import { PaginacaoResultado } from '@/infrastructure/api/ClienteApiRepository';
import { httpClient } from '@/infrastructure/api/httpClient';

export class TrajeApiRepository implements ITrajeRepository {
  private readonly trajeApi: AxiosInstance;

  constructor(trajeApi: AxiosInstance = httpClient) {
    this.trajeApi = trajeApi;
  }

  async listar(
    busca?: string,
    pagina?: number,
    tamanhoPagina?: number,
    status?: string,
    genero?: string,
    tipo?: string,
    tamanho?: string
  ): Promise<PaginacaoResultado<TrajeResponse>> {
    try {
      const params: Record<string, string | number> = {};
      if (busca) params.busca = busca;
      if (pagina !== undefined) params.pagina = pagina;
      if (tamanhoPagina !== undefined) params.tamanhoPagina = tamanhoPagina;
      if (status) params.status = status;
      if (genero) params.genero = genero;
      if (tipo) params.tipo = tipo;
      if (tamanho) params.tamanho = tamanho;

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

  async buscarPeriodosAlugados(trajeId: number): Promise<PeriodoAlugado[]> {
    try {
      const resposta = await this.trajeApi.get<PeriodoAlugado[]>(
        `/trajes/${trajeId}/periodos-alugados`,
      );
      return resposta.data.map((periodo) => ({
        dataRetirada: normalizarDataIso(periodo.dataRetirada),
        dataDevolucao: normalizarDataIso(periodo.dataDevolucao),
      }));
    } catch (error_) {
      if (isAxiosError(error_) && error_.response?.status === 404) {
        throw new RecursoNaoEncontrado('Traje', trajeId);
      }
      throw this.criarErro(error_, 'Erro ao buscar períodos alugados');
    }
  }

  private normalizarDados(dados: TrajeRequest): Record<string, unknown> {
    const dadosAjustados = { ...dados } as Record<string, unknown>;

    if (dadosAjustados.imagem && !dadosAjustados.imagemUrl) {
      dadosAjustados.imagemUrl = dadosAjustados.imagem;
      delete dadosAjustados.imagem;
    }

    if (dadosAjustados.valorItem !== undefined && dadosAjustados.valorItem !== null) {
      dadosAjustados.valorItem = Number(dadosAjustados.valorItem);
    }

    return dadosAjustados;
  }

  private normalizarResposta(traje: TrajeResponse): TrajeResponse {
    const trajeNormalizado = { ...traje } as Record<string, unknown>;

    if (trajeNormalizado.imagemUrl && !trajeNormalizado.imagem) {
      trajeNormalizado.imagem = trajeNormalizado.imagemUrl;
    }

    if (trajeNormalizado.valorItem !== undefined && !trajeNormalizado.preco) {
      trajeNormalizado.preco = Number(trajeNormalizado.valorItem);
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
