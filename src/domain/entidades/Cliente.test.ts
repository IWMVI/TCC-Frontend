import { Cliente, SiglaEstado } from '../entidades/Cliente';

describe('Cliente Entity', () => {
  const clienteValido: Cliente = {
    id: 1,
    nome: 'João Silva',
    cpfCnpj: '123.456.789-00',
    email: 'joao@email.com',
    celular: '(11) 99999-9999',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua Teste',
      numero: '123',
      cidade: 'São Paulo',
      bairro: 'Centro',
      estado: SiglaEstado.SP,
    },
    dataCadastro: '2024-01-01',
  };

  it('deve criar um cliente com dados válidos', () => {
    expect(clienteValido.id).toBe(1);
    expect(clienteValido.nome).toBe('João Silva');
    expect(clienteValido.endereco.estado).toBe(SiglaEstado.SP);
  });

  it('deve permitir complemento opcional', () => {
    const clienteComComplemento: Cliente = {
      ...clienteValido,
      endereco: {
        ...clienteValido.endereco,
        complemento: 'Apto 101',
      },
    };
    expect(clienteComComplemento.endereco.complemento).toBe('Apto 101');
  });

  it('deve validar estados brasileiros', () => {
    expect(SiglaEstado.SP).toBe('SP');
    expect(SiglaEstado.RJ).toBe('RJ');
    expect(SiglaEstado.MG).toBe('MG');
  });
});