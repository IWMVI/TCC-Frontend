import { IAuthRepository } from '@domain/interfaces/IAuthRepository';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';

export class ConfirmarEmailUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(token: string): Promise<FuncionarioResponse> {
    return this.repositorio.confirmarEmail(token);
  }
}
