import { AxiosInstance } from 'axios';
import { TrajeApiRepository } from './TrajeApiRepository';
import { PaginacaoResultado } from './ClienteApiRepository';
import { TrajeRequest, TrajeResponse } from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';

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

describe('TrajeApiRepository', () => {
  const baseUrl = 'http://localhost:8080';
  let repositorio: TrajeApiRepository;

  beforeEach(() => {
    repositorio = new TrajeApiRepository(baseUrl);
    jest.clearAllMocks();
  });

  const mockTrajeResponse: TrajeResponse = {
    id: 1,
    codigo: 'TRJ001',
    nome: 'Traje Formal',
    descricao: 'Traje elegante',
    tecido: 'Seda',
    cor: 'Preto',
    tipoTraje: 'Formal',
    preco: 150,
    tamanho: 'M',
    textura: 'Lisa',
    status: 'DISPONIVEL',
    sexo: 'MASCULINO',
    condicao: 'NOVO',
    dataCadastro: '2024-01-01',
  };

  const mockPaginacao: PaginacaoResultado<TrajeResponse> = {
    content: [mockTrajeResponse],
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
      data: { message: 'Traje não encontrado' },
      headers: {},
      config: { url: '/trajes/1' },
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
      config: { url: '/trajes' },
    };
    return error;
  }

  describe('listar', () => {
    it('deve listar trajes com paginação quando sucesso', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockPaginacao });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      const resultado = await repositorio.listar(undefined, 0, 10);

      expect(resultado).toEqual(mockPaginacao);
      expect(mockGet).toHaveBeenCalledWith('/trajes', {
        params: { pagina: 0, tamanho: 10 },
      });
    });

    it('deve incluir termo de busca quando fornecido', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockPaginacao });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await repositorio.listar('Formal', 0, 10);

      expect(mockGet).toHaveBeenCalledWith('/trajes', {
        params: { busca: 'Formal', pagina: 0, tamanho: 10 },
      });
    });

    it('deve lançar FalhaConexão quando não houver conexão', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosErrorNetwork());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await expect(repositorio.listar()).rejects.toThrow(FalhaConexao);
    });

    it('deve lançar FalhaRequisicao quando erro HTTP', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosError500());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('listarTodos', () => {
    it('deve listar todos os trajes quando sucesso', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: [mockTrajeResponse] });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      const resultado = await repositorio.listarTodos();

      expect(resultado).toHaveLength(1);
      expect(mockGet).toHaveBeenCalledWith('/trajes/todos');
    });

    it('deve lançar FalhaConexão quando não houver conexão', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosErrorNetwork());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await expect(repositorio.listarTodos()).rejects.toThrow(FalhaConexao);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar traje por id quando existir', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: mockTrajeResponse });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      const resultado = await repositorio.buscarPorId(1);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockGet).toHaveBeenCalledWith('/trajes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando não existir', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosError404());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await expect(repositorio.buscarPorId(999)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar FalhaConexão quando não houver conexão', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosErrorNetwork());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      await expect(repositorio.buscarPorId(1)).rejects.toThrow(FalhaConexao);
    });
  });

  describe('criar', () => {
    const mockTrajeRequest: TrajeRequest = {
      nome: 'Traje Novo',
      descricao: 'Descrição',
      tecido: 'Seda',
      cor: 'Azul',
      tipo: 'Formal',
      valorItem: 150,
      tamanho: 'M',
      textura: 'Lisa',
      status: 'DISPONIVEL',
      genero: 'MASCULINO',
      condicao: 'NOVO',
    };

    it('deve criar traje quando dados forem válidos', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: mockTrajeResponse });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { post: mockPost } as unknown as AxiosInstance;

      const resultado = await repositorio.criar(mockTrajeRequest);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockPost).toHaveBeenCalledWith('/trajes', expect.any(Object));
    });

    it('deve lançar FalhaRequisicao quando erro HTTP', async () => {
      const mockPost = jest.fn().mockRejectedValue(criarAxiosError500());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { post: mockPost } as unknown as AxiosInstance;

      await expect(repositorio.criar(mockTrajeRequest)).rejects.toThrow(FalhaRequisicao);
    });
  });

  describe('atualizar', () => {
    const mockTrajeRequest: TrajeRequest = {
      nome: 'Traje Atualizado',
      descricao: 'Descrição atualizada',
      tecido: 'Algodão',
      cor: 'Vermelho',
      tipo: 'Casual',
      valorItem: 180,
      tamanho: 'G',
      textura: 'Texturizada',
      status: 'ALUGADO',
      genero: 'FEMININO',
      condicao: 'USADO',
    };

    it('deve atualizar traje quando dados forem válidos', async () => {
      const mockPut = jest.fn().mockResolvedValue({ data: mockTrajeResponse });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { put: mockPut } as unknown as AxiosInstance;

      const resultado = await repositorio.atualizar(1, mockTrajeRequest);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockPut).toHaveBeenCalledWith('/trajes/1', expect.any(Object));
    });

    it('deve lançar RecursoNaoEncontrado quando não existir', async () => {
      const mockPut = jest.fn().mockRejectedValue(criarAxiosError404());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { put: mockPut } as unknown as AxiosInstance;

      await expect(repositorio.atualizar(999, mockTrajeRequest)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  describe('deletar', () => {
    it('deve deletar traje quando id for válido', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { delete: mockDelete } as unknown as AxiosInstance;

      await expect(repositorio.deletar(1)).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/trajes/1');
    });

    it('deve lançar RecursoNaoEncontrado quando não existir', async () => {
      const mockDelete = jest.fn().mockRejectedValue(criarAxiosError404());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { delete: mockDelete } as unknown as AxiosInstance;

      await expect(repositorio.deletar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  describe('atualizarImagem', () => {
    it('deve atualizar imagem do traje', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: { imagemUrl: 'http://exemplo.com/imagem.jpg' } });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { post: mockPost } as unknown as AxiosInstance;

      const file = new File(['conteudo'], 'imagem.jpg', { type: 'image/jpeg' });
      const resultado = await repositorio.atualizarImagem(1, file);

      expect(resultado).toBe('http://exemplo.com/imagem.jpg');
      expect(mockPost).toHaveBeenCalledWith('/trajes/imagem', expect.any(FormData), expect.any(Object));
    });
  });

  describe('removerImagem', () => {
    it('deve remover imagem do traje', async () => {
      const mockDelete = jest.fn().mockResolvedValue({});
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { delete: mockDelete } as unknown as AxiosInstance;

      await expect(repositorio.removerImagem(1)).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('/trajes/imagem', { params: { trajeId: 1 } });
    });
  });

  describe('buscarImagem', () => {
    it('deve buscar imagem do traje quando existir', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: { imagemUrl: 'http://exemplo.com/imagem.jpg' } });
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      const resultado = await repositorio.buscarImagem(1);

      expect(resultado).toBe('http://exemplo.com/imagem.jpg');
    });

    it('deve retornar null quando imagem não existir', async () => {
      const mockGet = jest.fn().mockRejectedValue(criarAxiosError404());
      (repositorio as unknown as { trajeApi: AxiosInstance }).trajeApi = { get: mockGet } as unknown as AxiosInstance;

      const resultado = await repositorio.buscarImagem(1);

      expect(resultado).toBeNull();
    });
  });
});