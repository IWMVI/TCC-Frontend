import { render, screen } from '@testing-library/react';
import { Layout } from '@/interfaces-graficas/componentes/layout/Layout/Layout';
import { ProvedorTema } from '@/interfaces-graficas/contextos/ContextoTema';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/interfaces-graficas/contextos/ContextoAutenticacao', () => ({
  useAutenticacao: () => ({
    funcionario: { nome: 'Admin', email: 'admin@teste.local' },
    logout: jest.fn(),
  }),
}));

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

  it('deve renderizar o menu lateral com módulos principais', () => {
    renderLayout();

    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Trajes')).toBeInTheDocument();
    expect(screen.getByText('Aluguéis')).toBeInTheDocument();
    expect(screen.getByText('Finanças')).toBeInTheDocument();
    expect(screen.getByText('Funcionários')).toBeInTheDocument();
  });
});
