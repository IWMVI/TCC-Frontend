import { render, screen, fireEvent } from '@testing-library/react';
import { Paginacao } from '@/interfaces-graficas/componentes/base/Paginacao/Paginacao';

describe('Paginacao', () => {
  const defaultProps = {
    paginaAtual: 0,
    totalPaginas: 5,
    totalRegistros: 50,
    tamanhoPagina: 10,
    onPageChange: jest.fn(),
  };

  it('deve mostrar mensagem de nenhum registro e controles quando totalRegistros for 0', () => {
    render(
      <Paginacao
        paginaAtual={0}
        totalPaginas={1}
        totalRegistros={0}
        tamanhoPagina={10}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByText(/Nenhum registro encontrado/)).toBeInTheDocument();
    expect(screen.getByText(/10 itens por p/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByTitle('Próxima página')).toBeDisabled();
  });

  it('deve mostrar informações de paginação corretas', () => {
    render(<Paginacao {...defaultProps} />);

    expect(screen.getByText(/Mostrando 1 a 10 de 50 registros/)).toBeInTheDocument();
    expect(screen.getByText(/10 itens por p/)).toBeInTheDocument();
  });

  it('deve exibir controles mesmo com uma única página', () => {
    render(
      <Paginacao
        paginaAtual={0}
        totalPaginas={1}
        totalRegistros={3}
        tamanhoPagina={10}
        onPageChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByTitle('Próxima página')).toBeDisabled();
  });

  it('deve chamar onPageChange quando botão de próxima página for clicado', () => {
    render(<Paginacao {...defaultProps} />);

    fireEvent.click(screen.getByTitle('Próxima página'));

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('deve desabilitar botão de próxima página na última página', () => {
    render(<Paginacao {...defaultProps} paginaAtual={4} />);

    expect(screen.getByTitle('Próxima página')).toBeDisabled();
  });

  it('deve desabilitar botão de página anterior na primeira página', () => {
    render(<Paginacao {...defaultProps} paginaAtual={0} />);

    expect(screen.getByTitle('Página anterior')).toBeDisabled();
  });

  it('deve chamar onPageChange quando botão de primeira página for clicado', () => {
    render(<Paginacao {...defaultProps} paginaAtual={4} />);

    fireEvent.click(screen.getByTitle('Primeira página'));

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(0);
  });

  it('deve chamar onPageChange quando botão de última página for clicado', () => {
    render(<Paginacao {...defaultProps} />);

    fireEvent.click(screen.getByTitle('Última página'));

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('deve renderizar números de página corretamente', () => {
    render(<Paginacao {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 3' })).toBeInTheDocument();
  });

  it('deve chamar onPageChange quando página for clicada', () => {
    render(<Paginacao {...defaultProps} paginaAtual={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Página 3' }));

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('deve mostrar seletor de tamanho quando mostrarSeletorTamanho for true', () => {
    render(
      <Paginacao {...defaultProps} mostrarSeletorTamanho={true} onTamanhoChange={jest.fn()} />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('deve chamar onTamanhoChange quando tamanho for alterado', () => {
    const onTamanhoChange = jest.fn();
    render(
      <Paginacao {...defaultProps} mostrarSeletorTamanho={true} onTamanhoChange={onTamanhoChange} />
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '25' } });

    expect(onTamanhoChange).toHaveBeenCalledWith(25);
  });
});
