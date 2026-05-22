import { AtualizarAluguelUseCase } from '@/application/alugueis/AtualizarAluguelUseCase';
import { AluguelRepository } from '@/application/alugueis/CriarAluguelUseCase';
import { AluguelResponse, AluguelUpdateRequest, StatusAluguel, TipoOcasiao } from '@domain/entidades';

describe('AtualizarAluguelUseCase', () => {
  let mockRepositorio: jest.Mocked<AluguelRepository>;
  let useCase: AtualizarAluguelUseCase;

  beforeEach(() => {
    mockRepositorio = {
      atualizar: jest.fn(),
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      deletar: jest.fn(),
      marcarComoConcluido: jest.fn(),
      gerarContratoPdf: jest.fn(),
    };
    useCase = new AtualizarAluguelUseCase(mockRepositorio);
  });

  const dadosValidos: AluguelUpdateRequest = {
    dataRetirada: '2026-05-10',
    dataDevolucao: '2026-05-15',
    ocasiao: TipoOcasiao.CASAMENTO,
    status: StatusAluguel.ATIVO,
    itens: [{ trajeId: 10 }],
  };

  const responseMock: AluguelResponse = {
    id: 1,
    clienteId: 1,
    nomeCliente: 'Cliente Teste',
    dataAluguel: '2026-04-01',
    dataRetirada: '2026-05-10',
    dataDevolucao: '2026-05-15',
    status: StatusAluguel.ATIVO,
    valorDesconto: 0,
    valorMulta: 0,
    valorTotal: 500,
    ocasiao: TipoOcasiao.CASAMENTO,
    itens: [{ trajeId: 10, nomeTraje: 'Traje Social' }],
  };

  describe('executar', () => {
    it('deve atualizar aluguel quando todos os dados forem válidos', async () => {
      mockRepositorio.atualizar.mockResolvedValue(responseMock);

      const resultado = await useCase.executar(1, dadosValidos);

      expect(resultado).toEqual(responseMock);
      expect(mockRepositorio.atualizar).toHaveBeenCalledWith(1, dadosValidos);
    });

    it('deve rejeitar quando ID for inválido', async () => {
      await expect(useCase.executar(0, dadosValidos)).rejects.toThrow('ID de aluguel inválido');
      await expect(useCase.executar(-1, dadosValidos)).rejects.toThrow('ID de aluguel inválido');
    });

    it('deve rejeitar quando datas estiverem ausentes', async () => {
      await expect(useCase.executar(1, { ...dadosValidos, dataRetirada: '' })).rejects.toThrow('Datas de retirada e devolução são obrigatórias');
      await expect(useCase.executar(1, { ...dadosValidos, dataDevolucao: '' })).rejects.toThrow('Datas de retirada e devolução são obrigatórias');
    });

    it('deve rejeitar quando data de devolução for anterior ou igual à retirada', async () => {
      await expect(useCase.executar(1, { ...dadosValidos, dataDevolucao: '2026-05-09' })).rejects.toThrow('Data de devolução deve ser após a data de retirada');
      await expect(useCase.executar(1, { ...dadosValidos, dataDevolucao: '2026-05-10' })).rejects.toThrow('Data de devolução deve ser após a data de retirada');
    });

    it('deve rejeitar quando ocasião estiver ausente', async () => {
      await expect(useCase.executar(1, { ...dadosValidos, ocasiao: undefined as unknown as TipoOcasiao })).rejects.toThrow('Ocasião é obrigatória');
    });

    it('deve rejeitar quando status estiver ausente', async () => {
      await expect(useCase.executar(1, { ...dadosValidos, status: undefined as unknown as StatusAluguel })).rejects.toThrow('Status é obrigatório');
    });

    it('deve rejeitar quando não houver itens', async () => {
      await expect(useCase.executar(1, { ...dadosValidos, itens: [] })).rejects.toThrow('Pelo menos um item deve estar associado ao aluguel');
      await expect(useCase.executar(1, { ...dadosValidos, itens: undefined as unknown as [] })).rejects.toThrow('Pelo menos um item deve estar associado ao aluguel');
    });
  });
});
