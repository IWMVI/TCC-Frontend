import { IAluguemRepository, FiltrosAluguel } from '../../domain/interfaces';
import { AluguemResponse, StatusAluguel } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export class ListarAlugueisUseCase {
  constructor(private aluguelRepository: IAluguemRepository) {}

  async executar(busca?: string, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>> {
    return this.aluguelRepository.listar(busca, pagina, tamanho);
  }

  async executarComFiltros(filtros: FiltrosAluguel, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>> {
    const filtrosComPadrao: FiltrosAluguel = {
      status: StatusAluguel.ATIVO,
      ...filtros,
    };
    return this.aluguelRepository.listarComFiltros(filtrosComPadrao, pagina, tamanho);
  }
}
