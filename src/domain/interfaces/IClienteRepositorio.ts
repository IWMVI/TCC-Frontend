import { ClienteRequest, ClienteResponse } from '../entidades';

export interface IClienteRepositorio {
  listar(busca?: string): Promise<ClienteResponse[]>;
  buscarPorId(id: number): Promise<ClienteResponse>;
  criar(dados: ClienteRequest): Promise<ClienteResponse>;
  atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse>;
  deletar(id: number): Promise<void>;
}
