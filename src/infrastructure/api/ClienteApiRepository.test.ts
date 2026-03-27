import { AxiosError } from 'axios';
import { ClienteApiRepository, PaginacaoResultado } from './ClienteApiRepository';
import { ClienteRequest, ClienteResponse, SiglaEstado } from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';

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

  function criarAxiosError404(): AxiosError {
    const error = new Error('Request failed with status code 404') as AxiosError;
    (error as any).isAxiosError = true;
    (error as any).response = {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'Cliente não encontrado' },
      headers: {},
      config: { url: '/clientes/1' },
    };
    return error;
  }

  function criarAxiosErrorNetwork(): AxiosError {
    const error = new Error('Network Error') as AxiosError;
    (error as any).isAxiosError = true;
    error.code = 'ECONNREFUSED';
    return error;
  }

  function criarAxiosError500(): AxiosError {
    const error = new Error('Request failed with status code 500') as AxiosError;
    (error as any).isAxiosError = true;
    (error as any).response = {
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
      (repositorio as any).clienteApi = { get: mockGet };

      const resultado = await repositorio.listar(undefined, 0, 10);

      expect(resultado).toEqual(mockPaginacao);
      expect(mockGet).toHaveBeenCalledWith('/clientes', {
        params: { pagina: 0, tamanho: 10 },
      });
    });

    it('deve lançar FalhaConexao quando não houver resposta', async () => {
      (repositorio as any).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosErrorNetwork()),
      };

      await expect(repositorio.listar()).rejects.toThrow(FalhaConexao);
    });

    it('deve lançar FalhaRequisicao quando erro na resposta', async () => {
      (repositorio as any).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError500()),
      };

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar cliente por ID quando existir', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockClienteResponse });
      (repositorio as any).clienteApi = { get: mockGet };

      const resultado = await repositorio.buscarPorId(1);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockGet).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as any).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError404()),
      };

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
      (repositorio as any).clienteApi = { post: mockPost };

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
      (repositorio as any).clienteApi = { put: mockPut };

      const resultado = await repositorio.atualizar(1, clienteRequest);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockPut).toHaveBeenCalledWith('/clientes/1', clienteRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as any).clienteApi = {
        put: jest.fn().mockRejectedValue(criarAxiosError404()),
      };

      await expect(repositorio.atualizar(999, clienteRequest)).rejects.toThrow(
        RecursoNaoEncontrado
      );
    });
  });

  describe('deletar', () => {
    it('deve deletar cliente com sucesso', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      (repositorio as any).clienteApi = { delete: mockDelete };

      await repositorio.deletar(1);

      expect(mockDelete).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as any).clienteApi = {
        delete: jest.fn().mockRejectedValue(criarAxiosError404()),
      };

      await expect(repositorio.deletar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });
});
