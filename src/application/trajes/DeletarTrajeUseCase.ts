import { ITrajeRepository } from '../../domain/interfaces';

export class DeletarTrajeUseCase {
  constructor(private readonly trajeRepositorio: ITrajeRepository) {}

  async executar(id: number): Promise<void> {
    return this.trajeRepositorio.deletar(id);
  }
}