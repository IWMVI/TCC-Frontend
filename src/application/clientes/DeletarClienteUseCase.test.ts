import { DeletarClienteUseCase } from './DeletarClienteUseCase';
import { IClienteRepository } from '../../domain/interfaces';
import { FalhaRequisicao, FalhaConexao, RecursoNaoEncontrado } from '../../domain/erros';

describe('DeletarClienteUseCase', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepository>;
  let useCase: DeletarClienteUseCase;

  beforeEach(() => {
    mockClienteRepositorio = {
      criar: jest.fn(),
      listar: jest.fn(),
      listarTodos: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarMedidas: jest.fn(),
      atualizarMedidasFeminina: jest.fn(),
      atualizarMedidasMasculina: jest.fn(),
    };

    useCase = new DeletarClienteUseCase(mockClienteRepositorio);
  });

  describe('executar', () => {
    it('deve deletar cliente com sucesso quando ID for válido', async () => {
      // Arrange
      mockClienteRepositorio.deletar.mockResolvedValue(undefined);

      // Act
      const resultado = await useCase.executar(1);

      // Assert
      expect(resultado).toBeUndefined();
      expect(mockClienteRepositorio.deletar).toHaveBeenCalledWith(1);
      expect(mockClienteRepositorio.deletar).toHaveBeenCalledTimes(1);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir', async () => {
      // Arrange
      mockClienteRepositorio.deletar.mockRejectedValue(
        new FalhaRequisicao('Cliente não encontrado', 404)
      );

      // Act & Assert
      await expect(useCase.executar(999)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.deletar).toHaveBeenCalledWith(999);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar qualquer erro', async () => {
      // Arrange
      mockClienteRepositorio.deletar.mockRejectedValue(
        new FalhaRequisicao('Erro ao deletar cliente', 500)
      );

      // Act & Assert
      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.deletar).toHaveBeenCalledWith(1);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar erro de conexão', async () => {
      // Arrange
      mockClienteRepositorio.deletar.mockRejectedValue(new FalhaConexao());

      // Act & Assert
      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve chamar repositório exatamente uma vez', async () => {
      // Arrange
      mockClienteRepositorio.deletar.mockResolvedValue(undefined);

      // Act
      await useCase.executar(1);

      // Assert
      expect(mockClienteRepositorio.deletar).toHaveBeenCalledTimes(1);
    });
  });
});
