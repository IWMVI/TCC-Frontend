import { RegistrarDevolucaoUseCase } from './RegistrarDevolucaoUseCase';
import { IAluguemRepository } from '../../domain/interfaces';
import { DevolucaoRequest, DevolucaoResponse } from '../../domain/entidades';

describe('RegistrarDevolucaoUseCase', () => {
  let mockRepositorio: jest.Mocked<IAluguemRepository>;
  let useCase: RegistrarDevolucaoUseCase;

  beforeEach(() => {
    mockRepositorio = {
      registrarDevolucao: jest.fn(),
      listar: jest.fn(),
      listarComFiltros: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      marcarComoConcluido: jest.fn(),
      buscarAtivoByTrajeId: jest.fn(),
    };
    useCase = new RegistrarDevolucaoUseCase(mockRepositorio);
  });

  const devolucaoRequest: DevolucaoRequest = {
    dataDevolucao: '2026-05-15',
    valorMulta: 25,
    observacoes: 'Traje com pequeno rasgo na manga',
  };

  const devolucaoResponse: DevolucaoResponse = {
    idDevolucao: 1,
    dataDevolucao: '2026-05-15',
    valorMulta: 25,
    observacoes: 'Traje com pequeno rasgo na manga',
    idAluguel: 1,
  };

  describe('executar', () => {
    it('deve registrar devolucao e retornar dados confirmados', async () => {
      mockRepositorio.registrarDevolucao.mockResolvedValue(devolucaoResponse);

      const resultado = await useCase.executar(1, devolucaoRequest);

      expect(resultado).toEqual(devolucaoResponse);
      expect(mockRepositorio.registrarDevolucao).toHaveBeenCalledWith(1, devolucaoRequest);
    });

    it('deve registrar devolucao sem multa e observacoes opcionais', async () => {
      const devolucaoSimples: DevolucaoRequest = { dataDevolucao: '2026-05-15' };
      const responseSimples: DevolucaoResponse = {
        idDevolucao: 2,
        dataDevolucao: '2026-05-15',
        idAluguel: 2,
      };
      mockRepositorio.registrarDevolucao.mockResolvedValue(responseSimples);

      const resultado = await useCase.executar(2, devolucaoSimples);

      expect(resultado).toEqual(responseSimples);
      expect(mockRepositorio.registrarDevolucao).toHaveBeenCalledWith(2, devolucaoSimples);
    });

    it('deve propagar erro do repositorio', async () => {
      mockRepositorio.registrarDevolucao.mockRejectedValue(new Error('Aluguel não está ativo'));

      await expect(useCase.executar(99, devolucaoRequest)).rejects.toThrow('Aluguel não está ativo');
    });
  });
});
