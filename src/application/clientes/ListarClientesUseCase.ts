import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { IClienteRepository } from '@domain/interfaces';
import { ClienteResponse } from '@domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export class ListarClientesUseCase {
  constructor(private readonly clienteRepositorio: IClienteRepository) {}

  async executar(
    busca?: string,
    pagina = 0,
    tamanho = TAMANHO_PAGINA_PADRAO,
  ): Promise<PaginacaoResultado<ClienteResponse>> {
    return this.clienteRepositorio.listar(busca, pagina, tamanho);
  }
}
