import { IAluguelRepository } from '@domain/interfaces';
import { DevolucaoRequest, DevolucaoResponse } from '@domain/entidades';

export class RegistrarDevolucaoUseCase {
  constructor(private aluguelRepository: IAluguelRepository) {}

  async executar(aluguelId: number, dados: DevolucaoRequest): Promise<DevolucaoResponse> {
    return this.aluguelRepository.registrarDevolucao(aluguelId, dados);
  }
}
