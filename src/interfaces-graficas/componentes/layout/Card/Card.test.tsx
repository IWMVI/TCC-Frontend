import { render, screen } from '@testing-library/react';
import { Card } from '@/interfaces-graficas/componentes/layout/Card/Card';

describe('Card', () => {
  it('deve renderizar o título', () => {
    render(<Card titulo="Título do Card">Conteúdo</Card>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Título do Card');
  });

  it('deve renderizar children', () => {
    render(<Card titulo="Título">Conteúdo</Card>);
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});
