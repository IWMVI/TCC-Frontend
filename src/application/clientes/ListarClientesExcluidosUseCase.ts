import { IClienteRepository } from '@domain/interfaces';
import { ClienteResponse } from '@domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export class ListarClientesExcluidosUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<ClienteResponse>> {
    return this.clienteRepositorio.listarExcluidos(pagina, tamanho);
  }

  async executarTodos(): Promise<ClienteResponse[]> {
    return this.clienteRepositorio.listarTodosExcluidos();
  }
}
