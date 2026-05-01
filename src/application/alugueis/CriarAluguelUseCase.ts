import { AluguelRequest, AluguelResponse, AluguelUpdateRequest } from '@domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export interface AluguelRepository {
  criar(dados: AluguelRequest): Promise<AluguelResponse>;
  listar(busca?: string, pagina?: number, tamanho?: number): Promise<PaginacaoResultado<AluguelResponse>>;
  buscarPorId(id: number): Promise<AluguelResponse>;
	
	atualizar(id: number, dados: AluguelUpdateRequest): Promise<AluguelResponse>;
  deletar(id: number): Promise<void>;
  marcarComoConcluido(id: number): Promise<AluguelResponse>;
  gerarContratoPdf(id: number): Promise<Blob>;
}

export class CriarAluguelUseCase {
  constructor(private aluguelRepository: AluguelRepository) {}

  async executar(dados: AluguelRequest): Promise<AluguelResponse> {
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
