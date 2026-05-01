import { ITrajeRepository } from '@domain/interfaces';
import { TrajeResponse } from '@domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export class ListarTrajesUseCase {
  constructor(private readonly trajeRepositorio: ITrajeRepository) {}

  async executar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<TrajeResponse>> {
    return this.trajeRepositorio.listar(busca, pagina, tamanho);
  }
}