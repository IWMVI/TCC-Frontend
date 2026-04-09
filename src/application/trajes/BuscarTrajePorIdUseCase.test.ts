import { BuscarTrajePorIdUseCase } from './BuscarTrajePorIdUseCase';
import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeResponse } from '../../domain/entidades';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '../../domain/erros';

describe('BuscarTrajePorIdUseCase', () => {
  let mockTrajeRepositorio: jest.Mocked<ITrajeRepository>;
  let useCase: BuscarTrajePorIdUseCase;

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

    useCase = new BuscarTrajePorIdUseCase(mockTrajeRepositorio);
  });

  const mockTrajeResponse: TrajeResponse = {
    id: 1,
    codigo: 'TRJ001',
    nome: 'Traje 1',
    descricao: 'Descrição do traje 1',
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

  describe('executar', () => {
    it('deve buscar traje por id quando id for válido', async () => {
      mockTrajeRepositorio.buscarPorId.mockResolvedValue(mockTrajeResponse);

      const resultado = await useCase.executar(1);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockTrajeRepositorio.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('deve lançar RecursoNaoEncontrado quando traje não existir', async () => {
      mockTrajeRepositorio.buscarPorId.mockRejectedValue(
        new RecursoNaoEncontrado('Traje', 999)
      );

      await expect(useCase.executar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      mockTrajeRepositorio.buscarPorId.mockRejectedValue(
        new FalhaRequisicao('Erro ao buscar traje', 500)
      );

      await expect(useCase.executar(1)).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      mockTrajeRepositorio.buscarPorId.mockRejectedValue(new FalhaConexao());

      await expect(useCase.executar(1)).rejects.toThrow(FalhaConexao);
    });
  });
});