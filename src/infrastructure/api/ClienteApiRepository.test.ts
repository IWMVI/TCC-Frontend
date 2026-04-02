import { AxiosInstance } from 'axios';
import { ClienteApiRepository, PaginacaoResultado } from './ClienteApiRepository';
import { ClienteRequest, ClienteResponse, SiglaEstado } from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';

// Tipo para mock seguro de AxiosError com propriedades extras necessárias para testes
interface MockAxiosError extends Error {
  isAxiosError?: boolean;
  response?: {
    status: number;
    statusText: string;
    data: { message: string };
    headers: Record<string, string>;
    config?: Record<string, unknown>;
  };
  code?: string;
}

describe('ClienteApiRepository', () => {
  const baseUrl = 'http://localhost:8080';
  let repositorio: ClienteApiRepository;

  beforeEach(() => {
    repositorio = new ClienteApiRepository(baseUrl);
    jest.clearAllMocks();
  });

  const mockClienteResponse: ClienteResponse = {
    id: 1,
    nome: 'Cliente Teste',
    cpfCnpj: '12345678901',
    email: 'cliente@teste.com',
    celular: '11999999999',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Teste',
      numero: '100',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: 'SP' as SiglaEstado,
    },
    dataCadastro: '2024-01-01',
  };

  const mockPaginacao: PaginacaoResultado<ClienteResponse> = {
    content: [mockClienteResponse],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  function criarAxiosError404(): MockAxiosError {
    const error = new Error('Request failed with status code 404') as MockAxiosError;
    error.isAxiosError = true;
    error.response = {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'Cliente não encontrado' },
      headers: {},
      config: { url: '/clientes/1' },
    };
    return error;
  }

  function criarAxiosErrorNetwork(): MockAxiosError {
    const error = new Error('Network Error') as MockAxiosError;
    error.isAxiosError = true;
    error.code = 'ECONNREFUSED';
    return error;
  }

  function criarAxiosError500(): MockAxiosError {
    const error = new Error('Request failed with status code 500') as MockAxiosError;
    error.isAxiosError = true;
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { message: 'Erro interno' },
      headers: {},
      config: { url: '/clientes' },
    };
    return error;
  }

  describe('listar', () => {
    it('deve listar clientes com paginação quando sucesso', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockPaginacao });
      const mockApi = { get: mockGet } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      const resultado = await repositorio.listar(undefined, 0, 10);

      expect(resultado).toEqual(mockPaginacao);
      expect(mockGet).toHaveBeenCalledWith('/clientes', {
        params: { pagina: 0, tamanho: 10 },
      });
    });

    it('deve listar com termo de busca', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockPaginacao });
      const mockApi = { get: mockGet } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.listar('João', 0, 10);

      expect(mockGet).toHaveBeenCalledWith('/clientes', {
        params: { busca: 'João', pagina: 0, tamanho: 10 },
      });
    });

    it('deve lançar FalhaConexao quando não houver resposta', async () => {
      const mockApi = {
        get: jest.fn().mockRejectedValue(criarAxiosErrorNetwork()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.listar()).rejects.toThrow(FalhaConexao);
    });

    it('deve lançar FalhaRequisicao quando erro na resposta', async () => {
      const mockApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaRequisicao para erro genérico', async () => {
      const mockApi = {
        get: jest.fn().mockRejectedValue(new Error('Erro genérico')),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar cliente por ID quando existir', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockClienteResponse });
      const mockApi = { get: mockGet } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      const resultado = await repositorio.buscarPorId(1);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockGet).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      const mockApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.buscarPorId(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  describe('criar', () => {
    const clienteRequest: ClienteRequest = {
      nome: 'Novo Cliente',
      cpfCnpj: '12345678901',
      email: 'novo@email.com',
      celular: '11999999999',
      endereco: {
        cep: '01001000',
        logradouro: 'Rua Nova',
        numero: '200',
        cidade: 'São Paulo',
        bairro: 'Centro',
        estado: 'SP' as SiglaEstado,
      },
    };

    it('deve criar cliente com sucesso', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockClienteResponse });
      const mockApi = { post: mockPost } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      const resultado = await repositorio.criar(clienteRequest);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockPost).toHaveBeenCalledWith('/clientes', clienteRequest);
    });
  });

  describe('atualizar', () => {
    const clienteRequest: ClienteRequest = {
      nome: 'Cliente Atualizado',
      cpfCnpj: '12345678901',
      email: 'atualizado@email.com',
      celular: '11999999999',
      endereco: {
        cep: '01001000',
        logradouro: 'Rua Atualizada',
        numero: '300',
        cidade: 'São Paulo',
        bairro: 'Centro',
        estado: 'SP' as SiglaEstado,
      },
    };

    it('deve atualizar cliente com sucesso', async () => {
      const mockPut = jest.fn().mockResolvedValue({ data: mockClienteResponse });
      const mockApi = { put: mockPut } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      const resultado = await repositorio.atualizar(1, clienteRequest);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockPut).toHaveBeenCalledWith('/clientes/1', clienteRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      const mockApi = {
        put: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.atualizar(999, clienteRequest)).rejects.toThrow(
        RecursoNaoEncontrado
      );
    });
  });

  describe('deletar', () => {
    it('deve deletar cliente com sucesso', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      const mockApi = { delete: mockDelete } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.deletar(1);

      expect(mockDelete).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      const mockApi = {
        delete: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.deletar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  describe('Medidas Femininas', () => {
    const medidaFeminina = {
      clienteId: 1,
      cintura: 75,
      manga: 60,
      alturaBusto: 25,
      raioBusto: 18,
      corpo: 40,
      ombro: 38,
      decote: 12,
      quadril: 95,
      comprimentoVestido: 100,
    };

    it('deve criar medida feminina com sucesso', async () => {
      const mockPost = jest.fn().mockResolvedValue({});
      const mockApi = { post: mockPost } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.criarMedidaFeminina(medidaFeminina);

      expect(mockPost).toHaveBeenCalledWith('/medidas/feminina', medidaFeminina);
    });

    it('deve atualizar medida feminina com sucesso', async () => {
      const mockPut = jest.fn().mockResolvedValue({});
      const mockApi = { put: mockPut } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.atualizarMedidasFeminina(medidaFeminina, 1);

      expect(mockPut).toHaveBeenCalledWith('/medidas/feminina/1', medidaFeminina);
    });
  });

  describe('Medidas Masculinas', () => {
    const medidaMasculina = {
      clienteId: 1,
      cintura: 85,
      manga: 65,
      colarinho: 40,
      barra: 72,
      torax: 95,
    };

    it('deve criar medida masculina com sucesso', async () => {
      const mockPost = jest.fn().mockResolvedValue({});
      const mockApi = { post: mockPost } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.criarMedidaMasculina(medidaMasculina);

      expect(mockPost).toHaveBeenCalledWith('/medidas/masculina', medidaMasculina);
    });

    it('deve atualizar medida masculina com sucesso', async () => {
      const mockPut = jest.fn().mockResolvedValue({});
      const mockApi = { put: mockPut } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await repositorio.atualizarMedidasMasculina(medidaMasculina, 1);

      expect(mockPut).toHaveBeenCalledWith('/medidas/masculina/1', medidaMasculina);
    });
  });

  describe('Buscar Medidas', () => {
    it('deve buscar medidas do cliente com sucesso', async () => {
      const mockMedidas = [{ clienteId: 1, cintura: 75, manga: 60 }];
      const mockGet = jest.fn().mockResolvedValue({ data: mockMedidas });
      const mockApi = { get: mockGet } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      const resultado = await repositorio.buscarMedidas(1);

      expect(resultado).toEqual(mockMedidas);
      expect(mockGet).toHaveBeenCalledWith('/medidas', { params: { clienteId: 1 } });
    });

    it('deve lançar erro ao buscar medidas falhando', async () => {
      const mockApi = {
        get: jest.fn().mockRejectedValue(criarAxiosErrorNetwork()),
      } as unknown as AxiosInstance;
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = mockApi;

      await expect(repositorio.buscarMedidas(1)).rejects.toThrow(FalhaConexao);
    });
  });
});
