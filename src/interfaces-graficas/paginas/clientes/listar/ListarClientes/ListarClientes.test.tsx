import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProvedorClientes } from '@/interfaces-graficas/contextos/ContextoClientes';
import { ListarClientes } from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes';
import { ClienteApiRepository } from '@infrastructure/api';
import { SiglaEstado } from '@domain/entidades';

const mockListar = jest.fn();
const mockDeletar = jest.fn();

jest.mock('@infrastructure/api', () => {
  return {
    ClienteApiRepository: jest.fn().mockImplementation(() => ({
      listar: (...args: unknown[]) => mockListar(...args),
      deletar: (...args: unknown[]) => mockDeletar(...args),
    })),
  };
});

describe('ListarClientes', () => {
  it('deve exibir clientes ao ser renderizado em StrictMode', async () => {
    mockListar.mockResolvedValue({
      content: [
        {
          id: 1,
          nome: 'Cliente Cadastrado',
          cpfCnpj: '12345678901',
          email: 'cliente@email.com',
          celular: '11999999999',
          endereco: {
            cep: '01001000',
            logradouro: 'Rua Teste',
            numero: '100',
            cidade: 'São Paulo',
            bairro: 'Centro',
            estado: SiglaEstado.SP,
          },
          dataCadastro: '2026-06-11',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    });

    render(
      <React.StrictMode>
        <MemoryRouter>
          <ProvedorClientes>
            <ListarClientes />
          </ProvedorClientes>
        </MemoryRouter>
      </React.StrictMode>
    );

    expect(await screen.findByText('Cliente Cadastrado')).toBeInTheDocument();
    await waitFor(() => expect(mockListar).toHaveBeenCalled());
    expect(ClienteApiRepository).toHaveBeenCalled();
  });
});
