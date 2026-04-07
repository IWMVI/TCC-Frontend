import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeResponse } from '../../domain/entidades';

export class BuscarTrajePorIdUseCase {
  constructor(private readonly trajeRepositorio: ITrajeRepository) {}

  async executar(id: number): Promise<TrajeResponse> {
    return this.trajeRepositorio.buscarPorId(id);
  }
}