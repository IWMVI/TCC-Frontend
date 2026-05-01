import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CampoFormulario } from '@/interfaces-graficas/componentes/form/CampoFormulario/CampoFormulario';

describe('CampoFormulario', () => {
  const defaultProps: {
    label: string;
    nome: string;
    tipo: 'text' | 'email' | 'tel' | 'number' | 'password';
    valor: string;
    onChange: jest.Mock;
  } = {
    label: 'Nome',
    nome: 'nome',
    tipo: 'text',
    valor: '',
    onChange: jest.fn(),
  };

  it('deve renderizar o label', () => {
    render(<CampoFormulario {...defaultProps} />);
    expect(screen.getByText('Nome')).toBeInTheDocument();
  });

  it('deve renderizar asterisco quando obrigatorio for true', () => {
    render(<CampoFormulario {...defaultProps} obrigatorio />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('deve renderizar input com tipo correto', () => {
    render(<CampoFormulario {...defaultProps} tipo="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('deve renderizar input com valor correto', () => {
    render(<CampoFormulario {...defaultProps} valor="Valor Teste" />);
    expect(screen.getByRole('textbox')).toHaveValue('Valor Teste');
  });

  it('deve chamar onChange quando valor for alterado', () => {
    render(<CampoFormulario {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Novo Valor' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('Novo Valor');
  });

  it('deve chamar onBlur quando input for desfocado', () => {
    const onBlur = jest.fn();
    render(<CampoFormulario {...defaultProps} onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar mensagem de erro quando erro for fornecido após blur', async () => {
    const onBlur = jest.fn();
    render(<CampoFormulario {...defaultProps} erro="Campo obrigatório" onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    await waitFor(() => {
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem de erro quando erro for fornecido e input tiver valor', async () => {
    render(<CampoFormulario {...defaultProps} valor="algum valor" erro="Campo obrigatório" />);
    await waitFor(() => {
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
  });

  it('deve renderizar placeholder quando fornecido', () => {
    render(<CampoFormulario {...defaultProps} placeholder="Digite seu nome" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Digite seu nome');
  });

  it('deve aplicar maxLength quando fornecido', () => {
    render(<CampoFormulario {...defaultProps} maxLength={10} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10');
  });
});
