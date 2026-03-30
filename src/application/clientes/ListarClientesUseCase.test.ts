import { ListarClientesUseCase } from './ListarClientesUseCase';
import { IClienteRepository } from '../../domain/interfaces';
import { ClienteResponse, SiglaEstado } from '../../domain/entidades';
import { PaginacaoResultado } from '../../infrastructure/api/ClienteApiRepository';
import { FalhaConexao, FalhaRequisicao } from '../../domain/erros';

describe('ListarClientesUseCase', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepository>;
  let useCase: ListarClientesUseCase;

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

    useCase = new ListarClientesUseCase(mockClienteRepositorio);
  });

  const mockPaginacao: PaginacaoResultado<ClienteResponse> = {
    content: [
      {
        id: 1,
        nome: 'Cliente 1',
        cpfCnpj: '12345678901',
        email: 'cliente1@email.com',
        celular: '11999999999',
        endereco: {
          cep: '01001000',
          logradouro: 'Rua 1',
          numero: '100',
          cidade: 'São Paulo',
          bairro: 'Centro',
          estado: 'SP' as SiglaEstado,
        },
        dataCadastro: '2024-01-01',
      },
      {
        id: 2,
        nome: 'Cliente 2',
        cpfCnpj: '23456789012',
        email: 'cliente2@email.com',
        celular: '11988888888',
        endereco: {
          cep: '01002000',
          logradouro: 'Rua 2',
          numero: '200',
          cidade: 'São Paulo',
          bairro: 'Centro',
          estado: 'SP' as SiglaEstado,
        },
        dataCadastro: '2024-01-02',
      },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  describe('executar', () => {
    it('deve listar clientes com paginação quando dados forem válidos', async () => {
      // Arrange
      mockClienteRepositorio.listar.mockResolvedValue(mockPaginacao);

      // Act
      const resultado = await useCase.executar(undefined, 0, 10);

      // Assert
      expect(resultado).toEqual(mockPaginacao);
      expect(mockClienteRepositorio.listar).toHaveBeenCalledWith(undefined, 0, 10);
      expect(resultado.content).toHaveLength(2);
    });

    it('deve listar clientes com busca quando termo for fornecido', async () => {
      // Arrange
      mockClienteRepositorio.listar.mockResolvedValue({
        ...mockPaginacao,
        content: [mockPaginacao.content[0]],
        totalElements: 1,
      });

      // Act
      const resultado = await useCase.executar('Cliente 1', 0, 10);

      // Assert
      expect(mockClienteRepositorio.listar).toHaveBeenCalledWith('Cliente 1', 0, 10);
      expect(resultado.content).toHaveLength(1);
    });

    it('deve retornar lista vazia quando não houver clientes', async () => {
      // Arrange
      const emptyResult: PaginacaoResultado<ClienteResponse> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true,
      };

      mockClienteRepositorio.listar.mockResolvedValue(emptyResult);

      // Act
      const resultado = await useCase.executar(undefined, 0, 10);

      // Assert
      expect(resultado.content).toHaveLength(0);
      expect(resultado.empty).toBe(true);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      // Arrange
      mockClienteRepositorio.listar.mockRejectedValue(
        new FalhaRequisicao('Erro ao listar clientes', 500)
      );

      // Act & Assert
      await expect(useCase.executar()).rejects.toThrow(FalhaRequisicao);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      // Arrange
      mockClienteRepositorio.listar.mockRejectedValue(new FalhaConexao());

      // Act & Assert
      await expect(useCase.executar()).rejects.toThrow(FalhaConexao);
    });

    it('deve usar pagina padrão quando não fornecida', async () => {
      // Arrange
      mockClienteRepositorio.listar.mockResolvedValue(mockPaginacao);

      // Act
      await useCase.executar();

      // Assert
      expect(mockClienteRepositorio.listar).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });
});
