import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';
import { FuncionarioRequest, FuncionarioResponse } from '@/domain/entidades/Funcionario';

export class CriarFuncionarioUseCase {
  constructor(private readonly repositorio: IFuncionarioRepository) {}

  async executar(dados: FuncionarioRequest): Promise<FuncionarioResponse> {
    return this.repositorio.criar(dados);
  }
}
