import { IAuthRepository } from '@domain/interfaces/IAuthRepository';
import { LoginRequest, LoginResponse } from '@/domain/entidades/Auth';

export class LoginUseCase {
  constructor(private readonly repositorio: IAuthRepository) {}

  async executar(dados: LoginRequest): Promise<LoginResponse> {
    return this.repositorio.login(dados);
  }
}
