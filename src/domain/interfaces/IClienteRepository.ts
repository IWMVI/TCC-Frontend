import {
  ClienteRequest,
  ClienteResponse,
  MedidaFemininaRequest,
  MedidaFemininaResponse,
  MedidaMasculinaRequest,
  MedidaMasculinaResponse,
} from '@/domain/entidades';
import { PaginacaoResultado } from '@infrastructure/api/ClienteApiRepository';

export interface IClienteRepository {
  listar(
    busca?: string,
    pagina?: number,
    tamanho?: number
  ): Promise<PaginacaoResultado<ClienteResponse>>;
  listarTodos(): Promise<ClienteResponse[]>;
  buscarPorId(id: number): Promise<ClienteResponse>;
  criar(dados: ClienteRequest): Promise<ClienteResponse>;
  atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse>;
  deletar(id: number): Promise<void>;

  // Clientes Excluídos
  listarExcluidos(pagina?: number, tamanho?: number): Promise<PaginacaoResultado<ClienteResponse>>;
  listarTodosExcluidos(): Promise<ClienteResponse[]>;
  recuperarCliente(id: number): Promise<ClienteResponse>;

  buscarMedidas(
    clienteId: number
  ): Promise<MedidaFemininaResponse[] | MedidaMasculinaResponse[] | null>;

  atualizarMedidasFeminina(dados: MedidaFemininaRequest, id: number): Promise<void>;

  atualizarMedidasMasculina(dados: MedidaMasculinaRequest, id: number): Promise<void>;
}
