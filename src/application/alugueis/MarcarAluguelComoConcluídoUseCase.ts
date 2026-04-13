import { AluguemResponse } from '../../domain/entidades';
import { AluguemRepository } from './CriarAluguemUseCase';

export class MarcarAluguelComoConcluídoUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(id: number): Promise<AluguemResponse> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    return this.aluguelRepository.marcarComoConcluido(id);
  }
}
