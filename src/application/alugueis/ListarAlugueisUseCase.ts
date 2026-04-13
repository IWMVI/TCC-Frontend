import { AluguemResponse } from '../../domain/entidades';
import { AluguemRepository } from './CriarAluguemUseCase';

export class ListarAlugueisUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(busca?: string, pagina?: number, tamanho?: number): Promise<any> {
    return this.aluguelRepository.listar(busca, pagina, tamanho);
  }
}
