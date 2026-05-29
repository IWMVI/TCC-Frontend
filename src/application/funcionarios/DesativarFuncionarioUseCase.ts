import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';

export class DesativarFuncionarioUseCase {
  constructor(private readonly repositorio: IFuncionarioRepository) {}

  async executar(id: number): Promise<void> {
    return this.repositorio.desativar(id);
  }
}
