import { IClienteRepository } from '@domain/interfaces';
import { ClienteResponse } from '@domain/entidades';

export class RecuperarClienteUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(id: number): Promise<ClienteResponse> {
    return this.clienteRepositorio.recuperarCliente(id);
  }
}
