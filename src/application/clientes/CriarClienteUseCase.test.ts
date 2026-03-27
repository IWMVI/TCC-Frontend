import { CriarClienteUseCase } from './CriarClienteUseCase';
import { IClienteRepository } from '../../domain/interfaces';
import { ClienteRequest, ClienteResponse, SiglaEstado } from '../../domain/entidades';
import { FalhaConexao, FalhaRequisicao } from '../../domain/erros';

describe('CriarClienteUseCase', () => {
  let mockClienteRepositorio: jest.Mocked<IClienteRepository>;
  let useCase: CriarClienteUseCase;

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

    useCase = new CriarClienteUseCase(mockClienteRepositorio);
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
      estado: 'SP' as SiglaEstado,
      complemento: 'Sala 1',
    },
  };

  describe('executar', () => {
    it('deve criar cliente com sucesso quando dados forem válidos', async () => {
      // Arrange
      const clienteSalvo: ClienteResponse = {
        id: 1,
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
          estado: 'SP' as SiglaEstado,
          complemento: 'Sala 1',
        },
        dataCadastro: '2024-01-01',
      };

      mockClienteRepositorio.criar.mockResolvedValue(clienteSalvo);

      // Act
      const resultado = await useCase.executar(clienteRequest);

      // Assert
      expect(resultado).toEqual(clienteSalvo);
      expect(mockClienteRepositorio.criar).toHaveBeenCalledWith(clienteRequest);
      expect(mockClienteRepositorio.criar).toHaveBeenCalledTimes(1);
    });

    it('deve lançar FalhaRequisicao quando repositório lançar erro', async () => {
      // Arrange
      mockClienteRepositorio.criar.mockRejectedValue(
        new FalhaRequisicao('Erro ao criar cliente', 400)
      );

      // Act & Assert
      await expect(useCase.executar(clienteRequest)).rejects.toThrow(FalhaRequisicao);
      expect(mockClienteRepositorio.criar).toHaveBeenCalledWith(clienteRequest);
    });

    it('deve lançar FalhaConexao quando não houver conexão', async () => {
      // Arrange
      mockClienteRepositorio.criar.mockRejectedValue(new FalhaConexao());

      // Act & Assert
      await expect(useCase.executar(clienteRequest)).rejects.toThrow(FalhaConexao);
    });

    it('deve chamar repositório exatamente uma vez', async () => {
      // Arrange
      const clienteSalvo: ClienteResponse = {
        id: 1,
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
          estado: 'SP' as SiglaEstado,
          complemento: 'Sala 1',
        },
        dataCadastro: '2024-01-01',
      };

      mockClienteRepositorio.criar.mockResolvedValue(clienteSalvo);

      // Act
      await useCase.executar(clienteRequest);

      // Assert
      expect(mockClienteRepositorio.criar).toHaveBeenCalledTimes(1);
    });
  });
});
