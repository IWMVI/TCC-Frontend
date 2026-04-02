import { BuscarClientePorIdUseCase } from './BuscarClientePorIdUseCase';
import { IClienteRepository } from '../../domain/interfaces';
import { ClienteResponse, SiglaEstado } from '../../domain/entidades';
import { FalhaRequisicao, FalhaConexao, RecursoNaoEncontrado } from '../../domain/erros';

describe('BuscarClientePorIdUseCase', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepository>;
  let useCase: BuscarClientePorIdUseCase;

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

    useCase = new BuscarClientePorIdUseCase(mockClienteRepositorio);
  });

  const clienteResponse: ClienteResponse = {
    id: 1,
    nome: 'João da Silva',
    cpfCnpj: '12345678901',
    email: 'joao@email.com',
    celular: '11999999999',
    sexo: 'MASCULINO',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Exemplo',
      numero: '100',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: 'SP' as SiglaEstado,
      complemento: 'Sala 1',
    },
    dataCadastro: '2024-01-01',
  };

  describe('executar', () => {
    it('deve buscar cliente com sucesso quando ID for válido', async () => {
      // Arrange
      mockClienteRepositorio.buscarPorId.mockResolvedValue(clienteResponse);

      // Act
      const resultado = await useCase.executar(1);

      // Assert
      expect(resultado).toEqual(clienteResponse);
      expect(mockClienteRepositorio.buscarPorId).toHaveBeenCalledWith(1);
      expect(mockClienteRepositorio.buscarPorId).toHaveBeenCalledTimes(1);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir', async () => {
      // Arrange
      mockClienteRepositorio.buscarPorId.mockRejectedValue(
        new FalhaRequisicao('Cliente não encontrado', 404)
      );

      // Act & Assert
      await expect(useCase.executar(999)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.buscarPorId).toHaveBeenCalledWith(999);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar qualquer erro', async () => {
      // Arrange
      mockClienteRepositorio.buscarPorId.mockRejectedValue(
        new FalhaRequisicao('Erro ao buscar cliente', 500)
      );

      // Act & Assert
      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar erro de conexão', async () => {
      // Arrange
      mockClienteRepositorio.buscarPorId.mockRejectedValue(new FalhaConexao());

      // Act & Assert
      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve chamar repositório exatamente uma vez', async () => {
      // Arrange
      mockClienteRepositorio.buscarPorId.mockResolvedValue(clienteResponse);

      // Act
      await useCase.executar(1);

      // Assert
      expect(mockClienteRepositorio.buscarPorId).toHaveBeenCalledTimes(1);
    });
  });
});
