import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeRequest, TrajeResponse } from '../../domain/entidades';

export class CriarTrajeUseCase {
  constructor(private readonly trajeRepositorio: ITrajeRepository) {}

  async executar(dados: TrajeRequest): Promise<TrajeResponse> {
    return this.trajeRepositorio.criar(dados);
  }
}