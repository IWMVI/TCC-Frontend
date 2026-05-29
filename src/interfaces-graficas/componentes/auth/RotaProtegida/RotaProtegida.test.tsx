import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RotaProtegida } from '@/interfaces-graficas/componentes/auth/RotaProtegida/RotaProtegida';

const mockUseAutenticacao = jest.fn();

jest.mock('@/interfaces-graficas/contextos/ContextoAutenticacao', () => ({
  useAutenticacao: () => mockUseAutenticacao(),
}));

describe('RotaProtegida', () => {
  it('redireciona para login quando não autenticado', () => {
    mockUseAutenticacao.mockReturnValue({
      autenticado: false,
      carregando: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RotaProtegida />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renderiza conteúdo quando autenticado', () => {
    mockUseAutenticacao.mockReturnValue({
      autenticado: true,
      carregando: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RotaProtegida />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
