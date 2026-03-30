import { IClienteRepository } from '../../domain/interfaces';
import { RecursoNaoEncontrado } from '../../domain/erros';

export class DeletarClienteUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(id: number): Promise<void> {
    try {
      await this.clienteRepositorio.deletar(id);
    } catch {
      throw new RecursoNaoEncontrado('Cliente', id);
    }
  }
}
