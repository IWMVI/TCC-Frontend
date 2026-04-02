import { render, screen } from '@testing-library/react';
import { ProvedorClientes, useClientes } from './ContextoClientes';
import { ClienteResponse } from '../../domain/entidades';
import { SiglaEstado } from '../../domain/entidades/Cliente';

describe('ContextoClientes', () => {
  function TestComponent() {
    const { estado, dispatch } = useClientes();
    return (
      <div>
        <div data-testid="clientes-count">{estado.clientes.length}</div>
        <div data-testid="esta-carregando">{estado.estaCarregando ? 'true' : 'false'}</div>
        <div data-testid="erro-valor">{estado.erro ?? 'sem-erro'}</div>
        <button
          data-testid="btn-adicionar"
          onClick={() => {
            const novoCliente: ClienteResponse = {
              id: 1,
              nome: 'Cliente Teste',
              cpfCnpj: '12345678901',
              email: 'cliente@teste.com',
              celular: '11999999999',
              sexo: 'MASCULINO',
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
            dispatch({ tipo: 'ADICIONAR_CLIENTE', payload: novoCliente });
          }}
        >
          Adicionar
        </button>
        <button
          data-testid="btn-carregando"
          onClick={() => dispatch({ tipo: 'SET_CARREGANDO', payload: true })}
        >
          Carregando
        </button>
        <button
          data-testid="btn-erro"
          onClick={() => dispatch({ tipo: 'SET_ERRO', payload: 'Erro de teste' })}
        >
          Erro
        </button>
      </div>
    );
  }

  it('deve renderizar o provedor com estado inicial', () => {
    render(
      <ProvedorClientes>
        <TestComponent />
      </ProvedorClientes>
    );

    expect(screen.getByTestId('clientes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('esta-carregando')).toHaveTextContent('false');
  });

  it('deve fornecer estado inicial válido', () => {
    render(
      <ProvedorClientes>
        <TestComponent />
      </ProvedorClientes>
    );

    expect(screen.getByTestId('erro-valor')).toHaveTextContent('sem-erro');
  });
});
