import { IClienteRepositorio } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse } from '../../domain/entidades';

export class CriarClienteUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepositorio) {}

  async executar(dados: ClienteRequest): Promise<ClienteResponse> {
    return this.clienteRepositorio.criar(dados);
  }
}
