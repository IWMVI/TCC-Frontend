import { IAuthRepository } from '@domain/interfaces/IAuthRepository';
import { RedefinirSenhaRequest } from '@/domain/entidades/Auth';

export class RedefinirSenhaUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(dados: RedefinirSenhaRequest): Promise<void> {
    return this.repositorio.redefinirSenha(dados);
  }
}
