import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { IFuncionarioRepository } from '@domain/interfaces/IFuncionarioRepository';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';
import { PaginacaoResultado } from '@/infrastructure/api/ClienteApiRepository';

export class ListarFuncionariosUseCase {
  constructor(private readonly repositorio: IFuncionarioRepository) {}

  async executar(
    busca?: string,
    pagina = 0,
    tamanho = TAMANHO_PAGINA_PADRAO,
  ): Promise<PaginacaoResultado<FuncionarioResponse>> {
    return this.repositorio.listar(busca, pagina, tamanho);
  }
}
