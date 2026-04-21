import {AluguemResponse, AluguemUpdateRequest} from '../../domain/entidades';
import { AluguemRepository } from './CriarAluguemUseCase';

export class AtualizarAluguemUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}
	
	async executar(id: number, dados: AluguemUpdateRequest): Promise<AluguemResponse> {
    if (!id || id <= 0) {
      throw new Error('ID de aluguel inválido');
    }

    if (!dados.dataRetirada || !dados.dataDevolucao) {
      throw new Error('Datas de retirada e devolução são obrigatórias');
    }

    if (dados.dataDevolucao <= dados.dataRetirada) {
      throw new Error('Data de devolução deve ser após a data de retirada');
    }
		
		if (!dados.ocasiao) {
			throw new Error('Ocasião é obrigatória');
    }

		if (!dados.status) {
			throw new Error('Status é obrigatório');
		}

		if (!dados.itens || dados.itens.length === 0) {
			throw new Error('Pelo menos um item deve estar associado ao aluguel');
		}

    return this.aluguelRepository.atualizar(id, dados);
  }
}
