import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';

export class BuscarFuncionarioPorIdUseCase {
  constructor(private readonly repositorio: IFuncionarioRepository) {}

  async executar(id: number): Promise<FuncionarioResponse> {
    return this.repositorio.buscarPorId(id);
  }
}
