import { IClienteRepositorio } from '../../domain/interfaces';
import { ClienteResponse } from '../../domain/entidades';

export class ListarClientesUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepositorio) {}

  async executar(busca?: string): Promise<ClienteResponse[]> {
    return this.clienteRepositorio.listar(busca);
  }
}
