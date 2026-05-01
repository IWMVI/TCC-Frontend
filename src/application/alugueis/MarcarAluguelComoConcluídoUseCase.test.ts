import { MarcarAluguelComoConcluídoUseCase } from './MarcarAluguelComoConcluídoUseCase';
import { AluguelRepository } from './CriarAluguelUseCase';
import { AluguelResponse, StatusAluguel, TipoOcasiao } from '../../domain/entidades';

describe('MarcarAluguelComoConcluídoUseCase', () => {
  let mockRepositorio: jest.Mocked<AluguelRepository>;
  let useCase: MarcarAluguelComoConcluídoUseCase;

  beforeEach(() => {
    mockRepositorio = {
      marcarComoConcluido: jest.fn(),
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      gerarContratoPdf: jest.fn(),
    };
    useCase = new MarcarAluguelComoConcluídoUseCase(mockRepositorio);
  });

  const responseMock: AluguelResponse = {
    id: 1,
    clienteId: 1,
    nomeCliente: 'Cliente Teste',
    dataAluguel: '2026-04-01',
    dataRetirada: '2026-05-01',
    dataDevolucao: '2026-05-10',
    status: StatusAluguel.CONCLUIDO,
    valorDesconto: 0,
    valorTotal: 500,
    ocasiao: TipoOcasiao.CASAMENTO,
    itens: [],
  };

  describe('executar', () => {
    it('deve marcar aluguel como concluído quando ID for válido', async () => {
      mockRepositorio.marcarComoConcluido.mockResolvedValue(responseMock);

      const resultado = await useCase.executar(1);

      expect(resultado).toEqual(responseMock);
      expect(mockRepositorio.marcarComoConcluido).toHaveBeenCalledWith(1);
    });

    it('deve rejeitar quando ID for inválido', async () => {
      await expect(useCase.executar(0)).rejects.toThrow('ID de aluguel inválido');
      await expect(useCase.executar(-1)).rejects.toThrow('ID de aluguel inválido');
    });
  });
});
