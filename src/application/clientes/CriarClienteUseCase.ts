import { IClienteRepository } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse } from '../../domain/entidades';

export class CriarClienteUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(dados: ClienteRequest): Promise<ClienteResponse> {
    return this.clienteRepositorio.criar(dados);
  }
}
