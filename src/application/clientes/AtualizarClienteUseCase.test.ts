import { AtualizarClienteUseCase } from './AtualizarClienteUseCase';
import { IClienteRepository } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse, SiglaEstado } from '../../domain/entidades';
import { FalhaRequisicao, FalhaConexao, RecursoNaoEncontrado } from '../../domain/erros';

describe('AtualizarClienteUseCase', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepository>;
  let useCase: AtualizarClienteUseCase;

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

    useCase = new AtualizarClienteUseCase(mockClienteRepositorio);
  });

  const clienteRequest: ClienteRequest = {
    nome: 'João da Silva',
    cpfCnpj: '12345678901',
    email: 'joao@email.com',
    celular: '11999999999',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Exemplo',
      numero: '100',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: 'SP' as unknown as string,
      complemento: 'Sala 1',
    },
  };

  const clienteAtualizado: ClienteResponse = {
    id: 1,
    nome: 'João da Silva Atualizado',
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
    it('deve atualizar cliente com sucesso quando dados forem válidos', async () => {
      // Arrange
      mockClienteRepositorio.atualizar.mockResolvedValue(clienteAtualizado);

      // Act
      const resultado = await useCase.executar(1, clienteRequest);

      // Assert
      expect(resultado).toEqual(clienteAtualizado);
      expect(mockClienteRepositorio.atualizar).toHaveBeenCalledWith(1, clienteRequest);
      expect(mockClienteRepositorio.atualizar).toHaveBeenCalledTimes(1);
    });

    it('deve lançar RecursoNaoEncontrado quando cliente não existir', async () => {
      // Arrange
      mockClienteRepositorio.atualizar.mockRejectedValue(
        new FalhaRequisicao('Cliente não encontrado', 404)
      );

      // Act & Assert
      await expect(useCase.executar(999, clienteRequest)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.atualizar).toHaveBeenCalledWith(999, clienteRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar qualquer erro', async () => {
      // Arrange
      mockClienteRepositorio.atualizar.mockRejectedValue(
        new FalhaRequisicao('Erro ao atualizar cliente', 400)
      );

      // Act & Assert
      await expect(useCase.executar(1, clienteRequest)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockClienteRepositorio.atualizar).toHaveBeenCalledWith(1, clienteRequest);
    });

    it('deve lançar RecursoNaoEncontrado quando repositório lançar erro de conexão', async () => {
      // Arrange
      mockClienteRepositorio.atualizar.mockRejectedValue(new FalhaConexao());

      // Act & Assert
      await expect(useCase.executar(1, clienteRequest)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve chamar repositório exatamente uma vez', async () => {
      // Arrange
      mockClienteRepositorio.atualizar.mockResolvedValue(clienteAtualizado);

      // Act
      await useCase.executar(1, clienteRequest);

      // Assert
      expect(mockClienteRepositorio.atualizar).toHaveBeenCalledTimes(1);
    });
  });
});
