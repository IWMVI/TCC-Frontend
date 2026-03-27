import { IClienteRepository } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse } from '../../domain/entidades';
import { RecursoNaoEncontrado } from '../../domain/erros';

export class AtualizarClienteUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(id: number, dados: ClienteRequest): Promise<ClienteResponse> {
    try {
      return await this.clienteRepositorio.atualizar(id, dados);
    } catch {
      throw new RecursoNaoEncontrado('Cliente', id);
    }
  }
}
