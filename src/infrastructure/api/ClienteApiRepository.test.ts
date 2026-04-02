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
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { get: mockGet } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.listar(undefined, 0, 10);

      expect(resultado).toEqual(mockPaginacao);
      expect(mockGet).toHaveBeenCalledWith('/clientes', {
        params: { pagina: 0, tamanho: 10 },
      });
    });

    it('deve lançar FalhaConexao quando não houver resposta', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosErrorNetwork()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.listar()).rejects.toThrow(FalhaConexao);
    });

    it('deve lançar FalhaRequisicao quando erro na resposta', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar cliente por ID quando existir', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockClienteResponse });
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { get: mockGet } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.buscarPorId(1);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockGet).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as unknown as AxiosInstance;

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
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { post: mockPost } as unknown as unknown as AxiosInstance;

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
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { put: mockPut } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.atualizar(1, clienteRequest);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockPut).toHaveBeenCalledWith('/clientes/1', clienteRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        put: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.atualizar(999, clienteRequest)).rejects.toThrow(
        RecursoNaoEncontrado
      );
    });
  });

  describe('listarTodos', () => {
    it('deve listar todos os clientes sem paginação', async () => {
      const mockClientes: ClienteResponse[] = [mockClienteResponse];
      const mockGet = jest.fn().mockResolvedValue({ data: mockClientes });
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { get: mockGet } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.listarTodos();

      expect(resultado).toEqual(mockClientes);
      expect(mockGet).toHaveBeenCalledWith('/clientes/todos');
    });

    it('deve lançar erro ao falhar na listagem de todos', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.listarTodos()).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('criarMedidaFeminina', () => {
    const medidaFeminina = {
      clienteId: 1,
      cintura: 70,
      manga: 60,
      alturaBusto: 35,
      raioBusto: 45,
      corpo: 65,
      ombro: 40,
      decote: 35,
      quadril: 80,
      comprimentoVestido: 140,
    };

    it('deve criar medida feminina com sucesso', async () => {
      const mockPost = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { post: mockPost } as unknown as unknown as AxiosInstance;

      await repositorio.criarMedidaFeminina(medidaFeminina);

      expect(mockPost).toHaveBeenCalledWith('/medidas/feminina', medidaFeminina);
    });

    it('deve lançar erro ao falhar na criação de medidas femininas', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        post: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.criarMedidaFeminina(medidaFeminina)).rejects.toThrow(
        FalhaRequisicao
      );
    });
  });

  describe('criarMedidaMasculina', () => {
    const medidaMasculina = {
      clienteId: 1,
      cintura: 80,
      manga: 65,
      colarinho: 40,
      barra: 85,
      torax: 95,
    };

    it('deve criar medida masculina com sucesso', async () => {
      const mockPost = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { post: mockPost } as unknown as unknown as AxiosInstance;

      await repositorio.criarMedidaMasculina(medidaMasculina);

      expect(mockPost).toHaveBeenCalledWith('/medidas/masculina', medidaMasculina);
    });

    it('deve lançar erro ao falhar na criação de medidas masculinas', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        post: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.criarMedidaMasculina(medidaMasculina)).rejects.toThrow(
        FalhaRequisicao
      );
    });
  });

  describe('buscarMedidas', () => {
    const mockMedidasFemininas = [
      {
        id: 1,
        clienteId: 1,
        cintura: 70,
        manga: 60,
        alturaBusto: 35,
        raioBusto: 45,
        corpo: 65,
        ombro: 40,
        decote: 35,
        quadril: 80,
        comprimentoVestido: 140,
      },
    ];

    it('deve buscar medidas de um cliente quando existem', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockMedidasFemininas });
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { get: mockGet } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.buscarMedidas(1);

      expect(resultado).toEqual(mockMedidasFemininas);
      expect(mockGet).toHaveBeenCalledWith('/medidas', { params: { clienteId: 1 } });
    });

    it('deve retornar null quando cliente não tem medidas', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: null });
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { get: mockGet } as unknown as unknown as AxiosInstance;

      const resultado = await repositorio.buscarMedidas(1);

      expect(resultado).toBeNull();
    });

    it('deve lançar erro ao falhar na busca de medidas', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        get: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.buscarMedidas(1)).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('atualizarMedidasFeminina', () => {
    const medidaAtualizada = {
      clienteId: 1,
      cintura: 72,
      manga: 61,
      alturaBusto: 36,
      raioBusto: 46,
      corpo: 66,
      ombro: 41,
      decote: 36,
      quadril: 82,
      comprimentoVestido: 142,
    };

    it('deve atualizar medida feminina com sucesso', async () => {
      const mockPut = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { put: mockPut } as unknown as unknown as AxiosInstance;

      await repositorio.atualizarMedidasFeminina(medidaAtualizada, 1);

      expect(mockPut).toHaveBeenCalledWith('/medidas/feminina/1', medidaAtualizada);
    });

    it('deve lançar erro ao falhar na atualização de medidas femininas', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        put: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.atualizarMedidasFeminina(medidaAtualizada, 1)).rejects.toThrow(
        FalhaRequisicao
      );
    });
  });

  describe('atualizarMedidasMasculina', () => {
    const medidaAtualizada = {
      clienteId: 1,
      cintura: 82,
      manga: 66,
      colarinho: 41,
      barra: 86,
      torax: 96,
    };

    it('deve atualizar medida masculina com sucesso', async () => {
      const mockPut = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { put: mockPut } as unknown as unknown as AxiosInstance;

      await repositorio.atualizarMedidasMasculina(medidaAtualizada, 1);

      expect(mockPut).toHaveBeenCalledWith('/medidas/masculina/1', medidaAtualizada);
    });

    it('deve lançar erro ao falhar na atualização de medidas masculinas', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        put: jest.fn().mockRejectedValue(criarAxiosError500()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.atualizarMedidasMasculina(medidaAtualizada, 1)).rejects.toThrow(
        FalhaRequisicao
      );
    });
  });

  describe('deletar', () => {
    it('deve deletar cliente com sucesso', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = { delete: mockDelete } as unknown as unknown as AxiosInstance;

      await repositorio.deletar(1);

      expect(mockDelete).toHaveBeenCalledWith('/clientes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir (404)', async () => {
      (repositorio as unknown as { clienteApi: AxiosInstance }).clienteApi = {
        delete: jest.fn().mockRejectedValue(criarAxiosError404()),
      } as unknown as unknown as AxiosInstance;

      await expect(repositorio.deletar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });
});
