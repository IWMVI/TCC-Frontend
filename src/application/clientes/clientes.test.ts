import { AtualizarClienteUseCase } from './AtualizarClienteUseCase';
import { BuscarClientePorIdUseCase } from './BuscarClientePorIdUseCase';
import { DeletarClienteUseCase } from './DeletarClienteUseCase';
import { ClienteResponse, ClienteRequest, SiglaEstado } from '@domain/entidades';
import { RecursoNaoEncontrado, FalhaRequisicao } from '@domain/erros';

describe('Cliente UseCases', () => {
  const mockClienteResponse: ClienteResponse = {
    id: 1,
    nome: 'Cliente Teste',
    cpfCnpj: '12345678901',
    email: 'cliente@teste.com',
    celular: '11999999999',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Teste',
      numero: '100',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: 'SP' as SiglaEstado,
    },
    dataCadastro: '2024-01-01',
  };

  const mockClienteRequest: ClienteRequest = {
    nome: 'Cliente Teste',
    cpfCnpj: '12345678901',
    email: 'cliente@teste.com',
    celular: '11999999999',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Teste',
      numero: '100',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: 'SP' as SiglaEstado,
    },
  };

  describe('BuscarClientePorIdUseCase', () => {
    it('deve buscar cliente por ID com sucesso', async () => {
      const mockRepository = {
        buscarPorId: jest.fn().mockResolvedValue(mockClienteResponse),
      };

      const useCase = new BuscarClientePorIdUseCase(mockRepository as any);
      const resultado = await useCase.executar(1);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      const mockRepository = {
        buscarPorId: jest.fn().mockRejectedValue(new RecursoNaoEncontrado('Cliente', 999)),
      };

      const useCase = new BuscarClientePorIdUseCase(mockRepository as any);

      await expect(useCase.executar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar RecursoNaoEncontrado em qualquer erro', async () => {
      const mockRepository = {
        buscarPorId: jest.fn().mockRejectedValue(new FalhaRequisicao('Erro', 500)),
      };

      const useCase = new BuscarClientePorIdUseCase(mockRepository as any);

      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockRepository.buscarPorId).toHaveBeenCalledWith(1);
    });
  });

  describe('AtualizarClienteUseCase', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const mockRepository = {
        atualizar: jest.fn().mockResolvedValue(mockClienteResponse),
      };

      const useCase = new AtualizarClienteUseCase(mockRepository as any);
      const resultado = await useCase.executar(1, mockClienteRequest);

      expect(resultado).toEqual(mockClienteResponse);
      expect(mockRepository.atualizar).toHaveBeenCalledWith(1, mockClienteRequest);
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      const mockRepository = {
        atualizar: jest.fn().mockRejectedValue(new RecursoNaoEncontrado('Cliente', 999)),
      };

      const useCase = new AtualizarClienteUseCase(mockRepository as any);

      await expect(useCase.executar(999, mockClienteRequest)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar RecursoNaoEncontrado em qualquer erro', async () => {
      const mockRepository = {
        atualizar: jest.fn().mockRejectedValue(new FalhaRequisicao('Erro', 500)),
      };

      const useCase = new AtualizarClienteUseCase(mockRepository as any);

      await expect(useCase.executar(1, mockClienteRequest)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockRepository.atualizar).toHaveBeenCalledWith(1, mockClienteRequest);
    });
  });

  describe('DeletarClienteUseCase', () => {
    it('deve deletar cliente com sucesso', async () => {
      const mockRepository = {
        deletar: jest.fn().mockResolvedValue(void 0),
      };

      const useCase = new DeletarClienteUseCase(mockRepository as any);
      await useCase.executar(1);

      expect(mockRepository.deletar).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      const mockRepository = {
        deletar: jest.fn().mockRejectedValue(new RecursoNaoEncontrado('Cliente', 999)),
      };

      const useCase = new DeletarClienteUseCase(mockRepository as any);

      await expect(useCase.executar(999)).rejects.toThrow(RecursoNaoEncontrado);
    });

    it('deve lançar RecursoNaoEncontrado em qualquer erro', async () => {
      const mockRepository = {
        deletar: jest.fn().mockRejectedValue(new FalhaRequisicao('Erro', 500)),
      };

      const useCase = new DeletarClienteUseCase(mockRepository as any);

      await expect(useCase.executar(1)).rejects.toThrow(RecursoNaoEncontrado);
      expect(mockRepository.deletar).toHaveBeenCalledWith(1);
    });
  });
});
