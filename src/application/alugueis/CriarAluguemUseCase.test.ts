import { CriarAluguemUseCase, AluguemRepository } from './CriarAluguemUseCase';
import { AluguemRequest, AluguemResponse, TipoOcasiao, StatusAluguel } from '../../domain/entidades';

describe('CriarAluguemUseCase', () => {
  let mockRepositorio: jest.Mocked<AluguemRepository>;
  let useCase: CriarAluguemUseCase;

  beforeEach(() => {
    mockRepositorio = {
      criar: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      marcarComoConcluido: jest.fn(),
      gerarContratoPdf: jest.fn(),
    };
    useCase = new CriarAluguemUseCase(mockRepositorio);
  });

  const aluguelValido: AluguemRequest = {
    clienteId: 1,
    dataRetirada: '2026-05-10',
    dataDevolucao: '2026-05-15',
    ocasiao: TipoOcasiao.CASAMENTO,
    itens: [{ trajeId: 10 }],
  };

  const responseValido: AluguemResponse = {
    id: 1,
    clienteId: 1,
    nomeCliente: 'Cliente Teste',
    dataAluguel: '2026-05-01',
    dataRetirada: '2026-05-10',
    dataDevolucao: '2026-05-15',
    status: StatusAluguel.ATIVO,
    valorDesconto: 0,
    valorTotal: 500,
    ocasiao: TipoOcasiao.CASAMENTO,
    itens: [{ trajeId: 10, nomeTraje: 'Traje Social' }],
  };

  describe('executar', () => {
    it('deve criar aluguel quando todos os dados forem válidos', async () => {
      mockRepositorio.criar.mockResolvedValue(responseValido);

      const resultado = await useCase.executar(aluguelValido);

      expect(resultado).toEqual(responseValido);
      expect(mockRepositorio.criar).toHaveBeenCalledWith(aluguelValido);
    });

    it('deve criar aluguel com observações quando informadas', async () => {
      const dadosComObs = { ...aluguelValido, observacoes: 'Traje para casamento à noite' };
      mockRepositorio.criar.mockResolvedValue(responseValido);

      await useCase.executar(dadosComObs);

      expect(mockRepositorio.criar).toHaveBeenCalledWith(dadosComObs);
    });

    it('deve criar aluguel com desconto quando informado', async () => {
      const dadosComDesconto = { ...aluguelValido, valorDesconto: 50 };
      mockRepositorio.criar.mockResolvedValue(responseValido);

      await useCase.executar(dadosComDesconto);

      expect(mockRepositorio.criar).toHaveBeenCalledWith(dadosComDesconto);
    });

    it('deve rejeitar quando clienteId for inválido', async () => {
      await expect(useCase.executar({ ...aluguelValido, clienteId: 0 })).rejects.toThrow('Cliente inválido');
      await expect(useCase.executar({ ...aluguelValido, clienteId: -1 })).rejects.toThrow('Cliente inválido');
    });

    it('deve rejeitar quando datas estiverem ausentes', async () => {
      await expect(useCase.executar({ ...aluguelValido, dataRetirada: '' })).rejects.toThrow('Datas de retirada e devolução são obrigatórias');
      await expect(useCase.executar({ ...aluguelValido, dataDevolucao: '' })).rejects.toThrow('Datas de retirada e devolução são obrigatórias');
    });

    it('deve rejeitar quando data de devolução for anterior ou igual à retirada', async () => {
      await expect(useCase.executar({ ...aluguelValido, dataDevolucao: '2026-05-09' })).rejects.toThrow('Data de devolução deve ser após a data de retirada');
      await expect(useCase.executar({ ...aluguelValido, dataDevolucao: '2026-05-10' })).rejects.toThrow('Data de devolução deve ser após a data de retirada');
    });

    it('deve rejeitar quando ocasião estiver ausente', async () => {
      await expect(useCase.executar({ ...aluguelValido, ocasiao: undefined as unknown as TipoOcasiao })).rejects.toThrow('Ocasião é obrigatória');
    });

    it('deve rejeitar quando não houver itens', async () => {
      await expect(useCase.executar({ ...aluguelValido, itens: [] })).rejects.toThrow('Pelo menos um item deve ser adicionado ao aluguel');
      await expect(useCase.executar({ ...aluguelValido, itens: undefined as unknown as [] })).rejects.toThrow('Pelo menos um item deve ser adicionado ao aluguel');
    });
  });
});
