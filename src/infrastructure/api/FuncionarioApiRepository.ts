import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';
import {
  FuncionarioRequest,
  FuncionarioResponse,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';
import { PaginacaoResultado } from '@/infrastructure/api/ClienteApiRepository';
import { httpClient } from '@/infrastructure/api/httpClient';
import { tratarErroApi } from '@/infrastructure/api/apiErrorHandler';

export class FuncionarioApiRepository implements IFuncionarioRepository {
  async criar(dados: FuncionarioRequest): Promise<FuncionarioResponse> {
    try {
      const resposta = await httpClient.post<FuncionarioResponse>(
        '/funcionarios',
        dados,
      );
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async listar(
    busca?: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginacaoResultado<FuncionarioResponse>> {
    try {
      const params: Record<string, string | number> = {};
      if (busca) params.busca = busca;
      if (pagina !== undefined) params.pagina = pagina;
      if (tamanho !== undefined) params.tamanho = tamanho;

      const resposta = await httpClient.get<PaginacaoResultado<FuncionarioResponse>>(
        '/funcionarios',
        { params },
      );
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async buscarPorId(id: number): Promise<FuncionarioResponse> {
    try {
      const resposta = await httpClient.get<FuncionarioResponse>(`/funcionarios/${id}`);
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async atualizar(
    id: number,
    dados: FuncionarioUpdateRequest,
  ): Promise<FuncionarioResponse> {
    try {
      const resposta = await httpClient.put<FuncionarioResponse>(
        `/funcionarios/${id}`,
        dados,
      );
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async desativar(id: number): Promise<void> {
    try {
      await httpClient.delete(`/funcionarios/${id}`);
    } catch (erro) {
      tratarErroApi(erro);
    }
  }
}
