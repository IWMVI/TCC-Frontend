import { AluguemResponse, AluguemRequest } from '../../domain/entidades';
import { AluguemRepository } from './CriarAluguemUseCase';

export class AtualizarAluguemUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(id: number, dados: AluguemRequest): Promise<AluguemResponse> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    if (!dados.clienteId || dados.clienteId <= 0) {
      throw new Error('Cliente inválido');
    }

    if (!dados.dataRetirada || !dados.dataDevolucao) {
      throw new Error('Datas de retirada e devolução são obrigatórias');
    }

    if (dados.dataDevolucao <= dados.dataRetirada) {
      throw new Error('Data de devolução deve ser após a data de retirada');
    }

    if (!dados.itens || dados.itens.length === 0) {
      throw new Error('Pelo menos um item deve estar no aluguel');
    }

    return this.aluguelRepository.atualizar(id, dados);
  }
}
