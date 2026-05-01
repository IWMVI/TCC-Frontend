import { AluguelResponse } from '../../domain/entidades';
import { AluguelRepository } from './CriarAluguelUseCase';

export class MarcarAluguelComoConcluídoUseCase {
  constructor(private aluguelRepository: AluguelRepository) {}

  async executar(id: number): Promise<AluguelResponse> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    return this.aluguelRepository.marcarComoConcluido(id);
  }
}
