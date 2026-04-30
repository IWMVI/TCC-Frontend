import { ListarAlugueisUseCase } from './ListarAlugueisUseCase';
import { IAluguemRepository, FiltrosAluguel } from '../../domain/interfaces';
import { AluguemResponse, StatusAluguel, TipoOcasiao } from '../../domain/entidades';

describe('ListarAlugueisUseCase', () => {
  let mockRepositorio: jest.Mocked<IAluguemRepository>;
  let useCase: ListarAlugueisUseCase;

  beforeEach(() => {
    mockRepositorio = {
      listar: jest.fn(),
      listarComFiltros: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      marcarComoConcluido: jest.fn(),
      registrarDevolucao: jest.fn(),
      buscarAtivoByTrajeId: jest.fn(),
    };
    useCase = new ListarAlugueisUseCase(mockRepositorio);
  });

  const alugueisMock: AluguemResponse[] = [
    {
      id: 1,
      clienteId: 1,
      nomeCliente: 'Cliente A',
      dataAluguel: '2026-04-01',
      dataRetirada: '2026-05-01',
      dataDevolucao: '2026-05-10',
      status: StatusAluguel.ATIVO,
      valorDesconto: 0,
      valorTotal: 500,
      ocasiao: TipoOcasiao.CASAMENTO,
      itens: [],
    },
    {
      id: 2,
      clienteId: 2,
      nomeCliente: 'Cliente B',
      dataAluguel: '2026-04-02',
      dataRetirada: '2026-05-02',
      dataDevolucao: '2026-05-12',
      status: StatusAluguel.CONCLUIDO,
      valorDesconto: 10,
      valorTotal: 300,
      ocasiao: TipoOcasiao.FORMATURA,
      itens: [],
    },
  ];

  const paginacaoMock = {
    content: alugueisMock,
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  };

  describe('executar', () => {
    it('deve listar aluguéis com busca textual', async () => {
      mockRepositorio.listar.mockResolvedValue(paginacaoMock);

      const resultado = await useCase.executar('Cliente A', 0, 10);

      expect(resultado).toEqual(paginacaoMock);
      expect(mockRepositorio.listar).toHaveBeenCalledWith('Cliente A', 0, 10);
    });

    it('deve listar aluguéis sem parâmetros', async () => {
      mockRepositorio.listar.mockResolvedValue(paginacaoMock);

      await useCase.executar();

      expect(mockRepositorio.listar).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });

  describe('executarComFiltros', () => {
    it('deve listar aluguéis com filtros aplicados', async () => {
      mockRepositorio.listarComFiltros.mockResolvedValue(paginacaoMock);
      const filtros: FiltrosAluguel = { status: StatusAluguel.ATIVO, clienteId: 1 };

      const resultado = await useCase.executarComFiltros(filtros, 0, 10);

      expect(resultado).toEqual(paginacaoMock);
      expect(mockRepositorio.listarComFiltros).toHaveBeenCalledWith(
        { status: StatusAluguel.ATIVO, clienteId: 1 },
        0,
        10,
      );
    });

    it('deve usar status ATIVO como padrão quando status não for informado', async () => {
      mockRepositorio.listarComFiltros.mockResolvedValue(paginacaoMock);
      const filtros: FiltrosAluguel = { ocasiao: TipoOcasiao.CASAMENTO };

      await useCase.executarComFiltros(filtros);

      expect(mockRepositorio.listarComFiltros).toHaveBeenCalledWith(
        { ocasiao: TipoOcasiao.CASAMENTO, status: StatusAluguel.ATIVO },
        undefined,
        undefined,
      );
    });

    it('deve respeitar status explicitamente informado', async () => {
      mockRepositorio.listarComFiltros.mockResolvedValue(paginacaoMock);
      const filtros: FiltrosAluguel = { status: StatusAluguel.CONCLUIDO };

      await useCase.executarComFiltros(filtros);

      expect(mockRepositorio.listarComFiltros).toHaveBeenCalledWith(
        { status: StatusAluguel.CONCLUIDO },
        undefined,
        undefined,
      );
    });
  });
});
