import { IAluguelRepository, FiltrosAluguel } from '@domain/interfaces';
import { AluguelResponse, StatusAluguel } from '@domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';

export class ListarAlugueisUseCase {
  constructor(private aluguelRepository: IAluguelRepository) {}

  async executar(
    busca?: string,
    pagina = 0,
    tamanho = TAMANHO_PAGINA_PADRAO,
  ): Promise<PaginacaoResultado<AluguelResponse>> {
    return this.aluguelRepository.listar(busca, pagina, tamanho);
  }

  async executarComFiltros(
    filtros: FiltrosAluguel,
    pagina = 0,
    tamanho = TAMANHO_PAGINA_PADRAO,
  ): Promise<PaginacaoResultado<AluguelResponse>> {
    const filtrosComPadrao: FiltrosAluguel = {
      status: StatusAluguel.ATIVO,
      ...filtros,
    };
    return this.aluguelRepository.listarComFiltros(filtrosComPadrao, pagina, tamanho);
  }
}
