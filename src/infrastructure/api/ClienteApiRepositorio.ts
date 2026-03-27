import axios, {AxiosError, AxiosInstance} from 'axios';
import {IClienteRepositorio} from '@domain/interfaces';
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

export class ClienteApiRepositorio implements IClienteRepositorio {
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

    async listar(busca?: string): Promise<ClienteResponse[]> {
        try {
            const params = busca ? {busca} : undefined;
            const resposta = await this.clienteApi.get<ClienteResponse[]>('/clientes', {params});
            return resposta.data;
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao listar clientes');
        }
    }

    async buscarPorId(id: number): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.get<ClienteResponse>(`/clientes/${id}`);
            return resposta.data;
        } catch (error_) {
            if (error_ instanceof AxiosError && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            this.tratarErro(error_, 'Erro ao buscar cliente');
        }
    }

    async criar(dados: ClienteRequest): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.post<ClienteResponse>('/clientes', dados);
            return resposta.data;
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao criar cliente');
        }
    }

    async atualizar(id: number, dados: ClienteRequest): Promise<ClienteResponse> {
        try {
            const resposta = await this.clienteApi.put<ClienteResponse>(`/clientes/${id}`, dados);
            return resposta.data;
        } catch (error_) {
            if (error_ instanceof AxiosError && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            this.tratarErro(error_, 'Erro ao atualizar cliente');
        }
    }

    async deletar(id: number): Promise<void> {
        try {
            await this.clienteApi.delete(`/clientes/${id}`);
        } catch (error_) {
            if (error_ instanceof AxiosError && error_.response?.status === 404) {
                throw new RecursoNaoEncontrado('Cliente', id);
            }
            this.tratarErro(error_, 'Erro ao deletar cliente');
        }
    }

    async criarMedidaFeminina(dados: MedidaFemininaRequest): Promise<void> {
        try {
            await this.clienteApi.post('/medidas/feminina', dados);
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao salvar medidas femininas');
        }
    }

    async criarMedidaMasculina(dados: MedidaMasculinaRequest): Promise<void> {
        try {
            await this.clienteApi.post('/medidas/masculina', dados);
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao salvar medidas masculinas');
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
            this.tratarErro(error_, 'Erro ao buscar medidas');
            return null;
        }
    }

    async atualizarMedidasFeminina(dados: MedidaFemininaRequest, id: number): Promise<void> {
        try {
            await this.clienteApi.put(`/medidas/feminina/${id}`, dados);
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao atualizar medidas femininas');
        }
    }

    async atualizarMedidasMasculina(dados: MedidaMasculinaRequest, id: number): Promise<void> {
        try {
            await this.clienteApi.put(`/medidas/masculina/${id}`, dados);
        } catch (error_) {
            this.tratarErro(error_, 'Erro ao atualizar medidas masculinas');
        }
    }

    private tratarErro(erro: unknown, mensagemPadrao: string): never {
        if (erro instanceof AxiosError) {
            if (!erro.response) {
                throw new FalhaConexao();
            }
            const detalhes = erro.response.data?.message || erro.message;
            throw new FalhaRequisicao(`${mensagemPadrao}: ${detalhes}`, erro.response.status);
        }
        throw new FalhaRequisicao(mensagemPadrao);
    }
}
