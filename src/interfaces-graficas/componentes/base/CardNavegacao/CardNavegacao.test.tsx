import { render, screen } from '@testing-library/react';
import { CardNavegacao } from './CardNavegacao';
import { BrowserRouter } from 'react-router-dom';

describe('CardNavegacao', () => {
  it('deve renderizar o ícone', () => {
    render(
      <BrowserRouter>
        <CardNavegacao
          icone={<span data-testid="mock-icon">Icone</span>}
          titulo="Título"
          descricao="Descrição"
          rota="/test"
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('deve renderizar o título', () => {
    render(
      <BrowserRouter>
        <CardNavegacao
          icone={<span>Icone</span>}
          titulo="Título"
          descricao="Descrição"
          rota="/test"
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Título');
  });

  it('deve renderizar a descrição', () => {
    render(
      <BrowserRouter>
        <CardNavegacao
          icone={<span>Icone</span>}
          titulo="Título"
          descricao="Descrição"
          rota="/test"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });

  it('deve renderizar o botão com texto padrão', () => {
    render(
      <BrowserRouter>
        <CardNavegacao
          icone={<span>Icone</span>}
          titulo="Título"
          descricao="Descrição"
          rota="/test"
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Acessar');
  });

  it('deve renderizar o botão com texto personalizado', () => {
    render(
      <BrowserRouter>
        <CardNavegacao
          icone={<span>Icone</span>}
          titulo="Título"
          descricao="Descrição"
          rota="/test"
          textoBotao="Ir para página"
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Ir para página');
  });
});
