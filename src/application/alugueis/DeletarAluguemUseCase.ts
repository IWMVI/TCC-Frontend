import { AluguemRepository } from './CriarAluguemUseCase';

export class DeletarAluguemUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    return this.aluguelRepository.deletar(id);
  }
}
