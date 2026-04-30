import { IAluguemRepository, FiltrosAluguel } from '../../domain/interfaces';
import { AluguemResponse } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export class ListarAlugueisUseCase {
  constructor(private aluguelRepository: IAluguemRepository) {}

  async executar(busca?: string, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>> {
    return this.aluguelRepository.listar(busca, pagina, tamanho);
  }

  async executarComFiltros(filtros: FiltrosAluguel, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>> {
    return this.aluguelRepository.listarComFiltros(filtros, pagina, tamanho);
  }
}
