import { render, screen } from '@testing-library/react';
import { Tabela, Coluna } from '@/interfaces-graficas/componentes/data/Tabela/Tabela';

interface DadoTeste {
  id: number;
  nome: string;
  email: string;
}

describe('Tabela', () => {
  const colunas: Coluna<DadoTeste>[] = [
    { chave: 'id', titulo: 'ID' },
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'email', titulo: 'Email' },
  ];

  const dados: DadoTeste[] = [
    { id: 1, nome: 'João', email: 'joao@email.com' },
    { id: 2, nome: 'Maria', email: 'maria@email.com' },
  ];

  it('deve renderizar headers das colunas', () => {
    render(<Tabela colunas={colunas} dados={dados} />);

    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
  });

  it('deve renderizar dados corretamente', () => {
    render(<Tabela colunas={colunas} dados={dados} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('joao@email.com')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('maria@email.com')).toBeInTheDocument();
  });

  it('deve renderizar mensagem de carregando quando estaCarregando for true', () => {
    render(<Tabela colunas={colunas} dados={dados} estaCarregando />);

    expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
  });

  it('deve renderizar mensagem vazia quando dados for vazio', () => {
    render(<Tabela colunas={colunas} dados={[]} />);

    expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument();
  });

  it('deve renderizar dados com render function', () => {
    const colunasComRender: Coluna<DadoTeste>[] = [
      { chave: 'id', titulo: 'ID' },
      { chave: 'nome', titulo: 'Nome', render: (item: DadoTeste) => <strong>{item.nome}</strong> },
      { chave: 'email', titulo: 'Email' },
    ];

    render(<Tabela colunas={colunasComRender} dados={dados} />);

    expect(screen.getByRole('cell', { name: 'João' })).toHaveTextContent('João');
  });

  it('deve renderizar célula vazia quando valor for undefined', () => {
    const dadosComUndefined: DadoTeste[] = [{ id: 1, nome: 'João', email: '' }];

    render(<Tabela colunas={colunas} dados={dadosComUndefined} />);

    expect(screen.getByRole('cell', { name: '' })).toBeInTheDocument();
  });
});
