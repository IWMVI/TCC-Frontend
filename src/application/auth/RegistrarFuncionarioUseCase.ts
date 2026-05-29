import { IAuthRepository } from '@domain/interfaces/IAuthRepository';
import { RegistrarFuncionarioRequest } from '@/domain/entidades/Auth';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';

export class RegistrarFuncionarioUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(dados: RegistrarFuncionarioRequest): Promise<FuncionarioResponse> {
    return this.repositorio.registrar(dados);
  }
}
