import {
  FuncionarioRequest,
  FuncionarioResponse,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';
import { PaginacaoResultado } from '@/infrastructure/api/ClienteApiRepository';

export interface IFuncionarioRepository {
  criar(dados: FuncionarioRequest): Promise<FuncionarioResponse>;
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginacaoResultado<FuncionarioResponse>>;
  buscarPorId(id: number): Promise<FuncionarioResponse>;
  atualizar(
    id: number,
    dados: FuncionarioUpdateRequest,
  ): Promise<FuncionarioResponse>;
  desativar(id: number): Promise<void>;
}
