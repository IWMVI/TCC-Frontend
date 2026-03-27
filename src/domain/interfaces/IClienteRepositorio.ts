import {
  ClienteRequest,
  ClienteResponse,
  MedidaFemininaRequest,
  MedidaFemininaResponse,
  MedidaMasculinaRequest,
  MedidaMasculinaResponse,
} from '../entidades';

export interface IClienteRepositorio {
  listar(busca?: string): Promise<ClienteResponse[]>;
  buscarPorId(id: number): Promise<ClienteResponse>;
  criar(dados: ClienteRequest): Promise<ClienteResponse>;
  atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse>;
  deletar(id: number): Promise<void>;

  buscarMedidas(
    clienteId: number
  ): Promise<MedidaFemininaResponse[] | MedidaMasculinaResponse[] | null>;

  atualizarMedidasFeminina(dados: MedidaFemininaRequest, id: number): Promise<void>;

  atualizarMedidasMasculina(dados: MedidaMasculinaRequest, id: number): Promise<void>;
}
