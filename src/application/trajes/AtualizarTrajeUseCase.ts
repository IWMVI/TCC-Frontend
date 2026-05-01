import { ITrajeRepository } from '@domain/interfaces';
import { TrajeRequest, TrajeResponse } from '@domain/entidades';

export class AtualizarTrajeUseCase {
  constructor(private readonly trajeRepositorio: ITrajeRepository) {}

  async executar(id: number, dados: TrajeRequest): Promise<TrajeResponse> {
    return this.trajeRepositorio.atualizar(id, dados);
  }
}