import { IClienteRepository } from '../../domain/interfaces';
import { ClienteResponse } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export class ListarClientesUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<ClienteResponse>> {
    return this.clienteRepositorio.listar(busca, pagina, tamanho);
  }
}
