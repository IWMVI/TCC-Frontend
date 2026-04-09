import axios, {AxiosInstance, isAxiosError} from 'axios';
import {IClienteRepository} from '@domain/interfaces';
import {
    ClienteRequest,
    ClienteResponse,
    MedidaFemininaRequest,
    MedidaFemininaResponse,
    MedidaMasculinaRequest,
    MedidaMasculinaResponse,
} from '@domain/entidades';
import {FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado} from '@domain/erros';

const API_BASE_URL = 'http://localhost:8080';

export type PaginacaoResultado<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
};

export class ClienteApiRepository implements IClienteRepository {
    private readonly clienteApi: AxiosInstance;

    constructor(baseUrl: string = API_BASE_URL) {
        this.clienteApi = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
    }

    async listar(
        busca?: string,
        pagina?: number,
        tamanho?: number
    ): Promise<PaginacaoResultado<ClienteResponse>> {
        try {
            const params: Record<string, string | number> = {};
            if (busca) params.busca = busca;
            if (pagina !== undefined) params.pagina = pagina;
            if (tamanho !== undefined) params.tamanho = tamanho;

            const resposta = await this.clienteApi.get<PaginacaoResultado<ClienteResponse>>(
                '/clientes',
                {params}
            );
            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao listar clientes');
        }
    }

    async listarTodos(): Promise<ClienteResponse[]> {
        try {
            const resposta = await this.clienteApi.get<ClienteResponse[]>('/clientes/todos');
            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao listar clientes');
        }
    }

    async buscarPorId(id: number): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.get<ClienteResponse>(`/clientes/${id}`);
            return resposta.data;
        } catch (error_) {
            if (isAxiosError(error_) && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            throw this.criarErro(error_, 'Erro ao buscar cliente');
        }
    }

    async criar(dados: ClienteRequest): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.post<ClienteResponse>('/clientes', dados);
            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao criar cliente');
        }
    }

    async atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.put<ClienteResponse>(`/clientes/${id}`, dados);
            return resposta.data;
        } catch (error_) {
            if (isAxiosError(error_) && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            throw this.criarErro(error_, 'Erro ao atualizar cliente');
        }
    }

    async deletar(id: number): Promise<void> {
        try {
            await this.clienteApi.delete(`/clientes/${id}`);
        } catch (error_) {
            if (isAxiosError(error_) && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            throw this.criarErro(error_, 'Erro ao deletar cliente');
        }
    }

    async listarExcluidos(
        pagina?: number,
        tamanho?: number
    ): Promise<PaginacaoResultado<ClienteResponse>> {
        try {
            const params: Record<string, number> = {};
            if (pagina !== undefined) params.pagina = pagina;
            if (tamanho !== undefined) params.tamanho = tamanho;

            const resposta = await this.clienteApi.get<PaginacaoResultado<ClienteResponse>>(
                '/clientes/excluidos',
                {params}
            );
            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao listar clientes excluídos');
        }
    }

    async listarTodosExcluidos(): Promise<ClienteResponse[]> {
        try {
            const resposta = await this.clienteApi.get<ClienteResponse[]>(
                '/clientes/excluidos/todos'
            );
            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao listar clientes excluídos');
        }
    }

    async recuperarCliente(id: number): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.put<ClienteResponse>(
                `/clientes/${id}/recuperar`
            );
            return resposta.data;
        } catch (error_) {
            if (isAxiosError(error_) && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente excluído', id);
            }
            throw this.criarErro(error_, 'Erro ao recuperar cliente');
        }
    }

    async criarMedidaFeminina(dados: MedidaFemininaRequest): Promise<void> {
        try {
            await this.clienteApi.post('/medidas/feminina', dados);
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao salvar medidas femininas');
        }
    }

    async criarMedidaMasculina(dados: MedidaMasculinaRequest): Promise<void> {
        try {
            await this.clienteApi.post('/medidas/masculina', dados);
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao salvar medidas masculinas');
        }
    }

    async buscarMedidas(
        clienteId: number
    ): Promise<MedidaFemininaResponse[] | MedidaMasculinaResponse[] | null> {
        try {
            const resposta = await this.clienteApi.get<
                MedidaFemininaResponse[] | MedidaMasculinaResponse[]
            >('/medidas', {params: {clienteId}});

            return resposta.data;
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao buscar medidas');
        }
    }

    async atualizarMedidasFeminina(dados: MedidaFemininaRequest, id: number): Promise<void> {
        try {
            await this.clienteApi.put(`/medidas/feminina/${id}`, dados);
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao atualizar medidas femininas');
        }
    }

    async atualizarMedidasMasculina(dados: MedidaMasculinaRequest, id: number): Promise<void> {
        try {
            await this.clienteApi.put(`/medidas/masculina/${id}`, dados);
        } catch (error_) {
            throw this.criarErro(error_, 'Erro ao atualizar medidas masculinas');
        }
    }

    private criarErro(erro: unknown, mensagemPadrao: string): Error {
        if (isAxiosError(erro)) {
            if (!erro.response) {
                return new FalhaConexao(mensagemPadrao);
            }
            const detalhes = erro.response.data?.message || erro.message;
            return new FalhaRequisicao(`${mensagemPadrao}: ${detalhes}`, erro.response.status);
        }
        return new FalhaRequisicao(mensagemPadrao);
    }
}
