import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/interfaces-graficas/componentes/feedback/Modal/Modal';

describe('Modal', () => {
  const defaultProps = {
    titulo: 'Confirmação',
    mensagem: 'Tem certeza?',
    estaAberto: true,
    aoConfirmar: jest.fn(),
    aoCancelar: jest.fn(),
  };

  it('não deve renderizar conteúdo quando estaAberto for false', () => {
    render(<Modal {...defaultProps} estaAberto={false} />);
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('deve renderizar o título', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Confirmação');
  });

  it('deve renderizar a mensagem', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('deve renderizar botão de confirmar com texto padrão', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('deve renderizar botão de cancelar com texto padrão', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('deve renderizar botão de confirmar com texto personalizado', () => {
    render(<Modal {...defaultProps} textoBotaoConfirmar="Sim, confirmar" />);
    expect(screen.getByRole('button', { name: 'Sim, confirmar' })).toBeInTheDocument();
  });

  it('deve renderizar botão de cancelar com texto personalizado', () => {
    render(<Modal {...defaultProps} textoBotaoCancelar="Não, cancelar" />);
    expect(screen.getByRole('button', { name: 'Não, cancelar' })).toBeInTheDocument();
  });

  it('deve chamar aoConfirmar quando botão de confirmar for clicado', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(defaultProps.aoConfirmar).toHaveBeenCalledTimes(1);
  });

  it('deve chamar aoCancelar quando botão de cancelar for clicado', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(defaultProps.aoCancelar).toHaveBeenCalledTimes(1);
  });

  it('deve chamar aoCancelar quando overlay for clicado', () => {
    render(<Modal {...defaultProps} />);
    const overlay = document.querySelector('div');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(defaultProps.aoCancelar).toHaveBeenCalledTimes(1);
  });
});
