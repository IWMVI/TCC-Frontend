import { AluguemRequest, AluguemResponse, AluguemUpdateRequest } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';

export interface AluguemRepository {
  criar(dados: AluguemRequest): Promise<AluguemResponse>;
  listar(busca?: string, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguemResponse>>;
  buscarPorId(id: number): Promise<AluguemResponse>;
	
	atualizar(id: number, dados: AluguemUpdateRequest): Promise<AluguemResponse>;
  deletar(id: number): Promise<void>;
  marcarComoConcluido(id: number): Promise<AluguemResponse>;
}

export class CriarAluguemUseCase {
  constructor(private aluguelRepository: AluguemRepository) {}

  async executar(dados: AluguemRequest): Promise<AluguemResponse> {
    if (!dados.clienteId || dados.clienteId <= 0) {
      throw new Error('Cliente inválido');
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

    if (!dados.itens || dados.itens.length === 0) {
      throw new Error('Pelo menos um item deve ser adicionado ao aluguel');
    }

    return this.aluguelRepository.criar(dados);
  }
}
