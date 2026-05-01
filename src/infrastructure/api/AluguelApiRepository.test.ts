import {
  AluguelRequest,
  AluguelResponse,
  AluguelUpdateRequest,
  CondicaoTraje,
  DevolucaoRequest,
  DevolucaoResponse,
  StatusAluguel,
  TipoOcasiao,
} from '@domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';
import { AxiosInstance } from 'axios';
import { AluguelApiRepository } from '@/infrastructure/api/AluguelApiRepository';

interface MockAxiosError extends Error {
  isAxiosError?: boolean;
  response?: {
    status: number;
    statusText: string;
    data: { message?: string; erro?: string };
    headers: Record<string, string>;
    config?: Record<string, unknown>;
  };
  code?: string;
}

describe('AluguelApiRepository', () => {
  const baseUrl = 'http://localhost:8080';
  let repositorio: AluguelApiRepository;

  beforeEach(() => {
    repositorio = new AluguelApiRepository(baseUrl);
    jest.clearAllMocks();
  });

  const aluguelResponse: AluguelResponse = {
    id: 1,
    clienteId: 1,
    nomeCliente: 'Cliente Teste',
    dataAluguel: '2026-04-01',
    dataRetirada: '2026-05-01',
    dataDevolucao: '2026-05-10',
    status: StatusAluguel.ATIVO,
    valorDesconto: 0,
    valorTotal: 500,
    ocasiao: TipoOcasiao.CASAMENTO,
    itens: [{ trajeId: 10, nomeTraje: 'Traje Social' }],
  };

  function api(): { [key: string]: jest.Mock } {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
  }

  function injetarApi(mocks: ReturnType<typeof api>) {
    (repositorio as unknown as { aluguelApi: AxiosInstance }).aluguelApi =
      mocks as unknown as AxiosInstance;
  }

  function erro404(): MockAxiosError {
    const e = new Error('Not Found') as MockAxiosError;
    e.isAxiosError = true;
    e.response = { status: 404, statusText: 'Not Found', data: { message: 'Não encontrado' }, headers: {} };
    return e;
  }

  function erro500(): MockAxiosError {
    const e = new Error('Server Error') as MockAxiosError;
    e.isAxiosError = true;
    e.response = { status: 500, statusText: 'Error', data: { message: 'Erro interno' }, headers: {} };
    return e;
  }

  function erroRede(): MockAxiosError {
    const e = new Error('Network Error') as MockAxiosError;
    e.isAxiosError = true;
    e.code = 'ECONNREFUSED';
    return e;
  }

  // ===================== listar =====================

  describe('listar', () => {
    it('deve retornar aluguéis paginados sem filtro', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: [aluguelResponse] });
      injetarApi(mocks);

      const resultado = await repositorio.listar();

      expect(resultado.content).toHaveLength(1);
      expect(resultado.content[0].id).toBe(1);
      expect(mocks.get).toHaveBeenCalledWith('/alugueis');
    });

    it('deve filtrar por termo de busca no nome do cliente', async () => {
      const lista = [
        { ...aluguelResponse, id: 1, nomeCliente: 'Ana Silva' },
        { ...aluguelResponse, id: 2, nomeCliente: 'Bruno Costa' },
      ];
      const mocks = api();
      mocks.get.mockResolvedValue({ data: lista });
      injetarApi(mocks);

      const resultado = await repositorio.listar('Ana');

      expect(resultado.content).toHaveLength(1);
      expect(resultado.content[0].nomeCliente).toBe('Ana Silva');
    });

    it('deve filtrar por termo de busca no ID', async () => {
      const lista = [
        { ...aluguelResponse, id: 12, nomeCliente: 'Ana' },
        { ...aluguelResponse, id: 34, nomeCliente: 'Bruno' },
      ];
      const mocks = api();
      mocks.get.mockResolvedValue({ data: lista });
      injetarApi(mocks);

      const resultado = await repositorio.listar('12');

      expect(resultado.content).toHaveLength(1);
      expect(resultado.content[0].id).toBe(12);
    });

    it('deve paginar resultados corretamente', async () => {
      const lista = Array.from({ length: 25 }, (_, i) => ({
        ...aluguelResponse,
        id: i + 1,
        nomeCliente: `Cliente ${i + 1}`,
      }));
      const mocks = api();
      mocks.get.mockResolvedValue({ data: lista });
      injetarApi(mocks);

      const resultado = await repositorio.listar(undefined, 1, 10);

      expect(resultado.content).toHaveLength(10);
      expect(resultado.content[0].id).toBe(11);
      expect(resultado.totalElements).toBe(25);
      expect(resultado.totalPages).toBe(3);
      expect(resultado.number).toBe(1);
    });

    it('deve lançar FalhaConexao quando servidor estiver indisponível', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erroRede());
      injetarApi(mocks);

      await expect(repositorio.listar()).rejects.toThrow(FalhaConexao);
    });

    it('deve lançar FalhaRequisicao quando servidor retornar erro', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.listar()).rejects.toThrow(FalhaRequisicao);
    });
  });

  // ===================== buscarPorId =====================

  describe('buscarPorId', () => {
    it('deve retornar aluguel quando existir', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: aluguelResponse });
      injetarApi(mocks);

      const resultado = await repositorio.buscarPorId(1);

      expect(resultado).toEqual(aluguelResponse);
      expect(mocks.get).toHaveBeenCalledWith('/alugueis/1');
    });

    it('deve lançar RecursoNaoEncontrado quando aluguel não existir', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.buscarPorId(999)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar FalhaRequisicao para outros erros', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.buscarPorId(1)).rejects.toThrow(FalhaRequisicao);
    });
  });

  // ===================== criar =====================

  describe('criar', () => {
    const request: AluguelRequest = {
      clienteId: 1,
      dataRetirada: '2026-05-01',
      dataDevolucao: '2026-05-10',
      ocasiao: TipoOcasiao.CASAMENTO,
      itens: [{ trajeId: 10 }],
    };

    it('deve criar aluguel e retornar resposta do servidor', async () => {
      const mocks = api();
      mocks.post.mockResolvedValue({ data: aluguelResponse });
      injetarApi(mocks);

      const resultado = await repositorio.criar(request);

      expect(resultado).toEqual(aluguelResponse);
      expect(mocks.post).toHaveBeenCalledWith('/alugueis', expect.objectContaining({
        clienteId: 1,
        dataRetirada: '2026-05-01',
        dataDevolucao: '2026-05-10',
        ocasiao: TipoOcasiao.CASAMENTO,
        itens: [{ trajeId: 10 }],
      }));
    });

    it('deve enviar observacoes como null quando não informada', async () => {
      const mocks = api();
      mocks.post.mockResolvedValue({ data: aluguelResponse });
      injetarApi(mocks);

      await repositorio.criar(request);

      expect(mocks.post).toHaveBeenCalledWith('/alugueis', expect.objectContaining({
        observacoes: null,
      }));
    });

    it('deve enviar observacoes quando informada', async () => {
      const mocks = api();
      mocks.post.mockResolvedValue({ data: aluguelResponse });
      injetarApi(mocks);

      await repositorio.criar({ ...request, observacoes: 'Evento à noite' });

      expect(mocks.post).toHaveBeenCalledWith('/alugueis', expect.objectContaining({
        observacoes: 'Evento à noite',
      }));
    });

    it('deve lançar FalhaRequisicao quando criação falhar', async () => {
      const mocks = api();
      mocks.post.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.criar(request)).rejects.toThrow(FalhaRequisicao);
    });
  });

  // ===================== atualizar =====================

  describe('atualizar', () => {
    const updateRequest: AluguelUpdateRequest = {
      dataRetirada: '2026-05-02',
      dataDevolucao: '2026-05-12',
      ocasiao: TipoOcasiao.FORMATURA,
      status: StatusAluguel.ATIVO,
      itens: [{ trajeId: 10 }],
    };

    it('deve atualizar aluguel e retornar resposta', async () => {
      const mocks = api();
      mocks.put.mockResolvedValue({ data: { ...aluguelResponse, dataRetirada: '2026-05-02' } });
      injetarApi(mocks);

      const resultado = await repositorio.atualizar(1, updateRequest);

      expect(resultado.dataRetirada).toBe('2026-05-02');
      expect(mocks.put).toHaveBeenCalledWith('/alugueis/1', expect.objectContaining({
        dataRetirada: '2026-05-02',
        ocasiao: TipoOcasiao.FORMATURA,
      }));
    });

    it('deve lançar RecursoNaoEncontrado quando aluguel não existir', async () => {
      const mocks = api();
      mocks.put.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.atualizar(999, updateRequest)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  // ===================== deletar =====================

  describe('deletar', () => {
    it('deve deletar aluguel sem retornar valor', async () => {
      const mocks = api();
      mocks.delete.mockResolvedValue({});
      injetarApi(mocks);

      await repositorio.deletar(1);

      expect(mocks.delete).toHaveBeenCalledWith('/alugueis/1');
    });

    it('deve lançar RecursoNaoEncontrado quando aluguel não existir', async () => {
      const mocks = api();
      mocks.delete.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.deletar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  // ===================== marcarComoConcluido =====================

  describe('marcarComoConcluido', () => {
    it('deve marcar aluguel como concluído e retornar resposta', async () => {
      const concluido = { ...aluguelResponse, status: StatusAluguel.CONCLUIDO };
      const mocks = api();
      mocks.put.mockResolvedValue({ data: concluido });
      injetarApi(mocks);

      const resultado = await repositorio.marcarComoConcluido(1);

      expect(resultado.status).toBe(StatusAluguel.CONCLUIDO);
      expect(mocks.put).toHaveBeenCalledWith('/alugueis/1/concluir');
    });

    it('deve lançar RecursoNaoEncontrado quando aluguel não existir', async () => {
      const mocks = api();
      mocks.put.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.marcarComoConcluido(999)).rejects.toThrow(RecursoNaoEncontrado);
    });
  });

  // ===================== listarComFiltros =====================

  describe('listarComFiltros', () => {
    it('deve enviar apenas filtros preenchidos como query params', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: [aluguelResponse] });
      injetarApi(mocks);

      await repositorio.listarComFiltros({ status: StatusAluguel.ATIVO, clienteId: 5 });

      expect(mocks.get).toHaveBeenCalledWith('/alugueis', {
        params: { status: StatusAluguel.ATIVO, clienteId: 5 },
      });
    });

    it('deve enviar filtro de data de retirada', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: [] });
      injetarApi(mocks);

      await repositorio.listarComFiltros({
        dataRetiradaInicio: '2026-05-01',
        dataRetiradaFim: '2026-05-31',
      });

      expect(mocks.get).toHaveBeenCalledWith('/alugueis', {
        params: { dataRetiradaInicio: '2026-05-01', dataRetiradaFim: '2026-05-31' },
      });
    });

    it('deve enviar filtro de ocasião', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: [] });
      injetarApi(mocks);

      await repositorio.listarComFiltros({ ocasiao: TipoOcasiao.CASAMENTO });

      expect(mocks.get).toHaveBeenCalledWith('/alugueis', {
        params: { ocasiao: TipoOcasiao.CASAMENTO },
      });
    });

    it('deve paginar resultados retornados pelo servidor', async () => {
      const lista = Array.from({ length: 15 }, (_, i) => ({
        ...aluguelResponse,
        id: i + 1,
      }));
      const mocks = api();
      mocks.get.mockResolvedValue({ data: lista });
      injetarApi(mocks);

      const resultado = await repositorio.listarComFiltros({}, 1, 10);

      expect(resultado.content).toHaveLength(5);
      expect(resultado.totalElements).toBe(15);
      expect(resultado.totalPages).toBe(2);
    });

    it('deve lançar FalhaRequisicao quando requisição falhar', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.listarComFiltros({})).rejects.toThrow(FalhaRequisicao);
    });
  });

  // ===================== registrarDevolucao =====================

  describe('registrarDevolucao', () => {
    const devolucaoRequest: DevolucaoRequest = {
      dataDevolucao: '2026-05-15',
      valorMulta: 30,
      observacoes: 'Rasgo na manga',
      itens: [{ trajeId: 10, condicao: CondicaoTraje.AVARIADO }],
    };

    const devolucaoResponse: DevolucaoResponse = {
      idDevolucao: 1,
      dataDevolucao: '2026-05-15',
      valorMulta: 30,
      observacoes: 'Rasgo na manga',
      idAluguel: 1,
    };

    it('deve registrar devolucao e retornar resposta', async () => {
      const mocks = api();
      mocks.post.mockResolvedValue({ data: devolucaoResponse });
      injetarApi(mocks);

      const resultado = await repositorio.registrarDevolucao(1, devolucaoRequest);

      expect(resultado).toEqual(devolucaoResponse);
      expect(mocks.post).toHaveBeenCalledWith('/alugueis/1/devolucao', devolucaoRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando aluguel não existir', async () => {
      const mocks = api();
      mocks.post.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.registrarDevolucao(999, devolucaoRequest)).rejects.toThrow(
        RecursoNaoEncontrado,
      );
    });

    it('deve lançar FalhaRequisicao quando devolucao for inválida', async () => {
      const mocks = api();
      mocks.post.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.registrarDevolucao(1, devolucaoRequest)).rejects.toThrow(
        FalhaRequisicao,
      );
    });
  });

  // ===================== buscarAtivoByTrajeId =====================

  describe('buscarAtivoByTrajeId', () => {
    it('deve retornar aluguel ativo vinculado ao traje', async () => {
      const mocks = api();
      mocks.get.mockResolvedValue({ data: aluguelResponse });
      injetarApi(mocks);

      const resultado = await repositorio.buscarAtivoByTrajeId(10);

      expect(resultado).toEqual(aluguelResponse);
      expect(mocks.get).toHaveBeenCalledWith('/alugueis/traje/10/ativo');
    });

    it('deve lançar RecursoNaoEncontrado quando não houver aluguel ativo', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro404());
      injetarApi(mocks);

      await expect(repositorio.buscarAtivoByTrajeId(10)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar FalhaRequisicao para outros erros', async () => {
      const mocks = api();
      mocks.get.mockRejectedValue(erro500());
      injetarApi(mocks);

      await expect(repositorio.buscarAtivoByTrajeId(10)).rejects.toThrow(FalhaRequisicao);
    });
  });
});
