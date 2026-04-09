import { CriarTrajeUseCase } from './CriarTrajeUseCase';
import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeRequest, TrajeResponse } from '../../domain/entidades';
import { FalhaConexao, FalhaRequisicao } from '../../domain/erros';

describe('CriarTrajeUseCase', () => {
  let mockTrajeRepositorio: jest.Mocked<ITrajeRepository>;
  let useCase: CriarTrajeUseCase;

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
    };

    useCase = new CriarTrajeUseCase(mockTrajeRepositorio);
  });

  const mockTrajeRequest: TrajeRequest = {
    nome: 'Traje Novo',
    descricao: 'Descrição do traje',
    tecido: 'Seda',
    cor: 'Azul',
    tipo: 'Formal',
    valorItem: 200,
    tamanho: 'M',
    textura: 'Lisa',
    status: 'DISPONIVEL',
    genero: 'MASCULINO',
    condicao: 'NOVO',
  };

  const mockTrajeResponse: TrajeResponse = {
    id: 1,
    codigo: 'TRJ001',
    nome: 'Traje Novo',
    descricao: 'Descrição do traje',
    tecido: 'Seda',
    cor: 'Azul',
    tipoTraje: 'Formal',
    preco: 200,
    tamanho: 'M',
    textura: 'Lisa',
    status: 'DISPONIVEL',
    sexo: 'MASCULINO',
    condicao: 'NOVO',
    dataCadastro: '2024-01-01',
  };

  describe('executar', () => {
    it('deve criar traje quando dados forem válidos', async () => {
      mockTrajeRepositorio.criar.mockResolvedValue(mockTrajeResponse);

      const resultado = await useCase.executar(mockTrajeRequest);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockTrajeRepositorio.criar).toHaveBeenCalledWith(mockTrajeRequest);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      mockTrajeRepositorio.criar.mockRejectedValue(
        new FalhaRequisicao('Erro ao criar traje', 400)
      );

      await expect(useCase.executar(mockTrajeRequest)).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      mockTrajeRepositorio.criar.mockRejectedValue(new FalhaConexao());

      await expect(useCase.executar(mockTrajeRequest)).rejects.toThrow(FalhaConexao);
    });
  });
});