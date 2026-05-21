import { render, screen } from '@testing-library/react';
import { Layout } from '@/interfaces-graficas/componentes/layout/Layout/Layout';
import { ProvedorTema } from '@/interfaces-graficas/contextos/ContextoTema';
import { MemoryRouter } from 'react-router-dom';

function renderLayout() {
  return render(
    <ProvedorTema>
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </ProvedorTema>
  );
}

describe('Layout', () => {
  it('deve renderizar o título do header', () => {
    renderLayout();

    expect(screen.getByText('Painel Administrativo – Sistema Interno')).toBeInTheDocument();
  });

  it('deve renderizar o footer com copyright', () => {
    renderLayout();

    expect(screen.getByText('© 2025 Sistema Interno')).toBeInTheDocument();
  });
});
