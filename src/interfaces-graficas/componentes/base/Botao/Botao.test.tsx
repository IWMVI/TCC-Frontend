import { render, screen, fireEvent } from '@testing-library/react';
import { Botao } from '@/interfaces-graficas/componentes/base/Botao/Botao';

describe('Botao', () => {
  it('deve renderizar children corretamente', () => {
    render(<Botao>Clique aqui</Botao>);
    expect(screen.getByRole('button')).toHaveTextContent('Clique aqui');
  });

  it('deve ter botão habilitado por padrão', () => {
    render(<Botao>Botão</Botao>);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('deve aplicar tipo button por padrão', () => {
    render(<Botao>Botão</Botao>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('deve aplicar tipo submit quando tipoHtml for submit', () => {
    render(<Botao tipoHtml="submit">Botão</Botao>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('deve estar disabled quando disabled for true', () => {
    render(<Botao disabled>Botão</Botao>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn();
    render(<Botao onClick={handleClick}>Botão</Botao>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
