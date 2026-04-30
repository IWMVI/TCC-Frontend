import { DeletarAluguemUseCase } from './DeletarAluguemUseCase';
import { AluguemRepository } from './CriarAluguemUseCase';

describe('DeletarAluguemUseCase', () => {
  let mockRepositorio: jest.Mocked<AluguemRepository>;
  let useCase: DeletarAluguemUseCase;

  beforeEach(() => {
    mockRepositorio = {
      deletar: jest.fn(),
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      marcarComoConcluido: jest.fn(),
    };
    useCase = new DeletarAluguemUseCase(mockRepositorio);
  });

  describe('executar', () => {
    it('deve delegar exclusão ao repositório quando ID for válido', async () => {
      await useCase.executar(5);

      expect(mockRepositorio.deletar).toHaveBeenCalledWith(5);
      expect(mockRepositorio.deletar).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar quando ID for inválido', async () => {
      await expect(useCase.executar(0)).rejects.toThrow('ID de aluguel inválido');
      await expect(useCase.executar(-1)).rejects.toThrow('ID de aluguel inválido');
    });
  });
});
