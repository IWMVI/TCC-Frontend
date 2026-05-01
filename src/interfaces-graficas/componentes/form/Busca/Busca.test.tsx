import { render, screen, fireEvent } from '@testing-library/react';
import { Busca } from '@/interfaces-graficas/componentes/form/Busca/Busca';

describe('Busca', () => {
  const defaultProps = {
    valor: '',
    onChange: jest.fn(),
    placeholder: 'Buscar...',
  };

  it('deve renderizar input com placeholder correto', () => {
    render(<Busca {...defaultProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Buscar...');
  });

  it('deve renderizar input com valor correto', () => {
    render(<Busca {...defaultProps} valor="Termo de busca" />);
    expect(screen.getByRole('textbox')).toHaveValue('Termo de busca');
  });

  it('deve chamar onChange quando valor for alterado', () => {
    render(<Busca {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Novo Termo' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('Novo Termo');
  });

  it('deve chamar onSearch quando Enter for pressionado', () => {
    const onSearch = jest.fn();
    render(<Busca {...defaultProps} onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('deve chamar onSearch com valor atual quando Enter for pressionado', () => {
    const onSearch = jest.fn();
    render(<Busca {...defaultProps} valor="Termo" onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('Termo');
  });

  it('deve renderizar botão de limpar quando valor não for vazio', () => {
    render(<Busca {...defaultProps} valor="Termo" />);
    expect(screen.getByRole('button', { name: 'Limpar busca' })).toBeInTheDocument();
  });

  it('deve chamar onChange com vazio quando botão de limpar for clicado', () => {
    const onChange = jest.fn();
    render(<Busca {...defaultProps} valor="Termo" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
