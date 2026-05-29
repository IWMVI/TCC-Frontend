import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';
import {
  FuncionarioResponse,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';

export class AtualizarFuncionarioUseCase {
  constructor(private readonly repositorio: IFuncionarioRepository) {}

  async executar(
    id: number,
    dados: FuncionarioUpdateRequest,
  ): Promise<FuncionarioResponse> {
    return this.repositorio.atualizar(id, dados);
  }
}
