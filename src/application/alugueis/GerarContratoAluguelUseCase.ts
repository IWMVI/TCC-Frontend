import { AluguemRepository } from './CriarAluguemUseCase';

export class GerarContratoAluguelUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(id: number): Promise<Blob> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    return this.aluguelRepository.gerarContratoPdf(id);
  }
}
