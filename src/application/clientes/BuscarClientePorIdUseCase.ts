import { IClienteRepository } from '../../domain/interfaces';
import { ClienteResponse } from '../../domain/entidades';
import { RecursoNaoEncontrado } from '../../domain/erros';

export class BuscarClientePorIdUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(id: number): Promise<ClienteResponse> {
    try {
      return await this.clienteRepositorio.buscarPorId(id);
    } catch {
      throw new RecursoNaoEncontrado('Cliente', id);
    }
  }
}
