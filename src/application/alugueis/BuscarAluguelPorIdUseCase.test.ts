import { BuscarAluguelPorIdUseCase } from './BuscarAluguelPorIdUseCase';
import { AluguemRepository } from './CriarAluguemUseCase';
import { AluguemResponse, StatusAluguel, TipoOcasiao } from '../../domain/entidades';

describe('BuscarAluguelPorIdUseCase', () => {
  let mockRepositorio: jest.Mocked<AluguemRepository>;
  let useCase: BuscarAluguelPorIdUseCase;

  beforeEach(() => {
    mockRepositorio = {
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      listar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      marcarComoConcluido: jest.fn(),
      gerarContratoPdf: jest.fn(),
    };
    useCase = new BuscarAluguelPorIdUseCase(mockRepositorio);
  });

  const aluguelMock: AluguemResponse = {
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
    itens: [],
  };

  describe('executar', () => {
    it('deve buscar aluguel por ID válido', async () => {
      mockRepositorio.buscarPorId.mockResolvedValue(aluguelMock);

      const resultado = await useCase.executar(1);

      expect(resultado).toEqual(aluguelMock);
      expect(mockRepositorio.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('deve rejeitar quando ID for inválido', async () => {
      await expect(useCase.executar(0)).rejects.toThrow('ID de aluguel inválido');
      await expect(useCase.executar(-1)).rejects.toThrow('ID de aluguel inválido');
    });
  });
});
