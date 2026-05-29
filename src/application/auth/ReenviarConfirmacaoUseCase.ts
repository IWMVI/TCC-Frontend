import { IAuthRepository } from '@domain/interfaces/IAuthRepository';

export class ReenviarConfirmacaoUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(email: string): Promise<void> {
    return this.repositorio.reenviarConfirmacao(email);
  }
}
