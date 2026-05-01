import { AluguelRepository } from './CriarAluguelUseCase';

export class DeletarAluguelUseCase {
  constructor(private aluguelRepository: AluguelRepository) {}

  async executar(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    return this.aluguelRepository.deletar(id);
  }
}
