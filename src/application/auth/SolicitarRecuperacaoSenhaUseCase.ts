import { IAuthRepository } from '@domain/interfaces/IAuthRepository';

export class SolicitarRecuperacaoSenhaUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(email: string): Promise<void> {
    return this.repositorio.solicitarRecuperacaoSenha(email);
  }
}
