import { render, screen } from '@testing-library/react';
import { Layout } from '@/interfaces-graficas/componentes/layout/Layout/Layout';
import { MemoryRouter } from 'react-router-dom';

describe('Layout', () => {
  it('deve renderizar o título do header', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('Painel Administrativo – Sistema Interno')).toBeInTheDocument();
  });

  it('deve renderizar o footer com copyright', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );

    expect(screen.getByText('© 2025 Sistema Interno')).toBeInTheDocument();
  });
});
