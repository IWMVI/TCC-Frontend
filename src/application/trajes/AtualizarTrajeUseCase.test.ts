import { AtualizarTrajeUseCase } from './AtualizarTrajeUseCase';
import { ITrajeRepository } from '../../domain/interfaces';
import { TrajeRequest, TrajeResponse } from '../../domain/entidades';
import { FalhaConexao, FalhaRequisicao } from '../../domain/erros';

describe('AtualizarTrajeUseCase', () => {
  let mockTrajeRepositorio: jest.Mocked<ITrajeRepository>;
  let useCase: AtualizarTrajeUseCase;

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

    useCase = new AtualizarTrajeUseCase(mockTrajeRepositorio);
  });

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

  const mockTrajeResponse: TrajeResponse = {
    id: 1,
    codigo: 'TRJ001',
    nome: 'Traje Atualizado',
    descricao: 'Descrição atualizada',
    tecido: 'Algodão',
    cor: 'Vermelho',
    tipoTraje: 'Casual',
    preco: 180,
    tamanho: 'G',
    textura: 'Texturizada',
    status: 'ALUGADO',
    sexo: 'FEMININO',
    condicao: 'USADO',
    dataCadastro: '2024-01-01',
  };

  describe('executar', () => {
    it('deve atualizar traje quando dados forem válidos', async () => {
      mockTrajeRepositorio.atualizar.mockResolvedValue(mockTrajeResponse);

      const resultado = await useCase.executar(1, mockTrajeRequest);

      expect(resultado).toEqual(mockTrajeResponse);
      expect(mockTrajeRepositorio.atualizar).toHaveBeenCalledWith(1, mockTrajeRequest);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      mockTrajeRepositorio.atualizar.mockRejectedValue(
        new FalhaRequisicao('Erro ao atualizar traje', 400)
      );

      await expect(useCase.executar(1, mockTrajeRequest)).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      mockTrajeRepositorio.atualizar.mockRejectedValue(new FalhaConexao());

      await expect(useCase.executar(1, mockTrajeRequest)).rejects.toThrow(FalhaConexao);
    });
  });
});