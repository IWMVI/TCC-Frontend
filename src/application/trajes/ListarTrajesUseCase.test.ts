import { ListarTrajesUseCase } from './ListarTrajesUseCase';
import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeResponse } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';
import { FalhaConexao, FalhaRequisicao } from '../../domain/erros';

describe('ListarTrajesUseCase', () => {
  let mockTrajeRepositorio: jest.Mocked<ITrajeRepository>;
  let useCase: ListarTrajesUseCase;

  beforeEach(() => {
    mockTrajeRepositorio = {
      listar: jest.fn(),
      listarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      atualizarImagem: jest.fn(),
      removerImagem: jest.fn(),
      buscarPeriodosAlugados: jest.fn(),
    };

    useCase = new ListarTrajesUseCase(mockTrajeRepositorio);
  });

  const mockPaginacao: PaginacaoResultado<TrajeResponse> = {
    content: [
      {
        id: 1,
        codigo: 'TRJ001',
        nome: 'Traje 1',
        descricao: 'Descrição do traje 1',
        tecido: 'Tecido 1',
        cor: 'Preto',
        tipo: 'Formal',
        preco: 150,
        tamanho: 'M',
        textura: 'Lisa',
        status: 'DISPONIVEL',
        genero: 'MASCULINO',
        condicao: 'NOVO',
        dataCadastro: '2024-01-01',
      },
      {
        id: 2,
        codigo: 'TRJ002',
        nome: 'Traje 2',
        descricao: 'Descrição do traje 2',
        tecido: 'Tecido 2',
        cor: 'Branco',
        tipo: 'Casual',
        preco: 100,
        tamanho: 'G',
        textura: 'Texturizada',
        status: 'DISPONIVEL',
        genero: 'FEMININO',
        condicao: 'USADO',
        dataCadastro: '2024-01-02',
      },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  describe('executar', () => {
    it('deve listar trajes com paginação quando dados forem válidos', async () => {
      mockTrajeRepositorio.listar.mockResolvedValue(mockPaginacao);

      const resultado = await useCase.executar(undefined, 0, 10);

      expect(resultado).toEqual(mockPaginacao);
      expect(mockTrajeRepositorio.listar).toHaveBeenCalledWith(undefined, 0, 10);
      expect(resultado.content).toHaveLength(2);
    });

    it('deve listar trajes com busca quando termo for fornecido', async () => {
      mockTrajeRepositorio.listar.mockResolvedValue({
        ...mockPaginacao,
        content: [mockPaginacao.content[0]],
        totalElements: 1,
      });

      const resultado = await useCase.executar('Traje 1', 0, 10);

      expect(mockTrajeRepositorio.listar).toHaveBeenCalledWith('Traje 1', 0, 10);
      expect(resultado.content).toHaveLength(1);
    });

    it('deve retornar lista vazia quando não houver trajes', async () => {
      const emptyResult: PaginacaoResultado<TrajeResponse> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true,
      };

      mockTrajeRepositorio.listar.mockResolvedValue(emptyResult);

      const resultado = await useCase.executar(undefined, 0, 10);

      expect(resultado.content).toHaveLength(0);
      expect(resultado.empty).toBe(true);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      mockTrajeRepositorio.listar.mockRejectedValue(
        new FalhaRequisicao('Erro ao listar trajes', 500)
      );

      await expect(useCase.executar()).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      mockTrajeRepositorio.listar.mockRejectedValue(new FalhaConexao());

      await expect(useCase.executar()).rejects.toThrow(FalhaConexao);
    });

    it('deve usar parâmetros padrão quando não fornecidos', async () => {
      mockTrajeRepositorio.listar.mockResolvedValue(mockPaginacao);

      await useCase.executar();

      expect(mockTrajeRepositorio.listar).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });
});