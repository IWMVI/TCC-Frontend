import { IAluguemRepository, FiltrosAluguel } from '../../domain/interfaces';
import { StatusAluguel } from '../../domain/entidades';

export class ListarAlugueisUseCase {
  constructor(private aluguelRepository: IAluguemRepository) {}

  async executar(busca?: string, pagina?: number, tamanho?: number): Promise<any> {
    return this.aluguelRepository.listar(busca, pagina, tamanho);
  }

  async executarComFiltros(filtros: FiltrosAluguel, pagina?: number, tamanho?: number): Promise<any> {
    const filtrosEfetivos = { ...filtros, status: filtros.status ?? StatusAluguel.ATIVO };
    return this.aluguelRepository.listarComFiltros(filtrosEfetivos, pagina, tamanho);
  }
}
