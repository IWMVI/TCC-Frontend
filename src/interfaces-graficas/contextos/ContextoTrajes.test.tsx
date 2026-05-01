import { render, screen, waitFor } from '@testing-library/react';
import { ProvedorTrajes, useTrajes } from '@/interfaces-graficas/contextos/ContextoTrajes';
import { TrajeResponse } from '@domain/entidades';
import { act } from 'react';

jest.mock('@application/trajes/TrajeDependencies', () => ({
  TRAJE_CONSTANTS: {
    TAMANHO_PAGINA_PADRAO: 10,
    DEBOUNCE_DELAY_MS: 300,
    ROUTES: {
      LISTAR: '/trajes/listar',
      CRIAR: '/trajes/novo',
      EDITAR: expect.any(Function),
      LISTA: '/trajes',
    },
  },
  listarTrajesUseCase: {
    executar: jest.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  },
  atualizarTrajeUseCase: {
    executar: jest.fn(),
  },
  deletarTrajeUseCase: {
    executar: jest.fn(),
  },
  trajeRepository: {
    atualizarImagem: jest.fn(),
    removerImagem: jest.fn(),
  },
}));

describe('ContextoTrajes', () => {
  function TestComponent() {
    const { estado, dispatch } = useTrajes();
    return (
      <div>
        <div data-testid="trajes-count">{estado.trajes.length}</div>
        <div data-testid="esta-carregando">{estado.estaCarregando ? 'true' : 'false'}</div>
        <div data-testid="erro-valor">{estado.erro ?? 'sem-erro'}</div>
        <div data-testid="pagina-atual">{estado.paginaAtual}</div>
        <div data-testid="total-paginas">{estado.totalPaginas}</div>
        <button
          data-testid="btn-adicionar"
          onClick={() => {
            const novoTraje: TrajeResponse = {
              id: 1,
              codigo: 'TRJ001',
              nome: 'Traje Teste',
              descricao: 'Descrição teste',
              tecido: 'Seda',
              cor: 'Preto',
              tipo: 'Formal',
              preco: 150,
              tamanho: 'M',
              textura: 'Lisa',
              status: 'DISPONIVEL',
              genero: 'MASCULINO',
              condicao: 'NOVO',
              dataCadastro: '2024-01-01',
            };
            dispatch({ tipo: 'ADICIONAR_TRAJE', payload: novoTraje });
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
        <button
          data-testid="btn-remover"
          onClick={() => dispatch({ tipo: 'REMOVER_TRAJE', payload: 1 })}
        >
          Remover
        </button>
      </div>
    );
  }

  it('deve renderizar o provedor com estado inicial', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('trajes-count')).toHaveTextContent('0');
    });
    expect(screen.getByTestId('esta-carregando')).toHaveTextContent('false');
    expect(screen.getByTestId('pagina-atual')).toHaveTextContent('0');
    expect(screen.getByTestId('total-paginas')).toHaveTextContent('0');
  });

  it('deve fornecer estado inicial válido', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('erro-valor')).toHaveTextContent('sem-erro');
    });
  });

  it('deve adicionar traje ao estado', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('trajes-count')).toHaveTextContent('0');
    });

    act(() => {
      screen.getByTestId('btn-adicionar').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('trajes-count')).toHaveTextContent('1');
    });
  });

  it('deve atualizar estado de carregando', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('esta-carregando')).toHaveTextContent('false');
    });

    act(() => {
      screen.getByTestId('btn-carregando').click();
    });

    expect(screen.getByTestId('esta-carregando')).toHaveTextContent('true');
  });

  it('deve atualizar estado de erro', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('erro-valor')).toHaveTextContent('sem-erro');
    });

    act(() => {
      screen.getByTestId('btn-erro').click();
    });

    expect(screen.getByTestId('erro-valor')).toHaveTextContent('Erro de teste');
  });

  it('deve remover traje do estado', async () => {
    render(
      <ProvedorTrajes>
        <TestComponent />
      </ProvedorTrajes>
    );

    await waitFor(() => {
      expect(screen.getByTestId('trajes-count')).toHaveTextContent('0');
    });

    act(() => {
      screen.getByTestId('btn-adicionar').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('trajes-count')).toHaveTextContent('1');
    });

    act(() => {
      screen.getByTestId('btn-remover').click();
    });

    expect(screen.getByTestId('trajes-count')).toHaveTextContent('0');
  });
});