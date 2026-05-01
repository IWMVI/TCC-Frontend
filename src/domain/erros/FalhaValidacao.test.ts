import { FalhaValidacao, RecursoNaoEncontrado, FalhaRequisicao, FalhaConexao } from '@/domain/erros/FalhaValidacao';

describe('FalhaValidacao', () => {
  it('deve criar erro com mensagem e erros vazios por padrão', () => {
    const erro = new FalhaValidacao('Campo obrigatório');

    expect(erro.message).toBe('Campo obrigatório');
    expect(erro.name).toBe('FalhaValidacao');
    expect(erro.erros).toEqual({});
  });

  it('deve criar erro com objeto de erros personalizado', () => {
    const erros = {
      nome: ['Campo obrigatório'],
      email: ['Formato inválido'],
    };
    const erro = new FalhaValidacao('Dados inválidos', erros);

    expect(erro.message).toBe('Dados inválidos');
    expect(erro.erros).toBe(erros);
    expect(erro.erros.nome).toEqual(['Campo obrigatório']);
    expect(erro.erros.email).toEqual(['Formato inválido']);
  });
});

describe('RecursoNaoEncontrado', () => {
  it('deve criar erro com recurso e identificador', () => {
    const erro = new RecursoNaoEncontrado('Cliente', 1);

    expect(erro.message).toBe('Cliente com identificador 1 não encontrado');
    expect(erro.name).toBe('RecursoNaoEncontrado');
    expect(erro.recurso).toBe('Cliente');
    expect(erro.identificador).toBe(1);
  });

  it('deve criar erro com identificador string', () => {
    const erro = new RecursoNaoEncontrado('Produto', 'ABC123');

    expect(erro.message).toBe('Produto com identificador ABC123 não encontrado');
    expect(erro.recurso).toBe('Produto');
    expect(erro.identificador).toBe('ABC123');
  });
});

describe('FalhaRequisicao', () => {
  it('deve criar erro com mensagem e sem status code', () => {
    const erro = new FalhaRequisicao('Requisição inválida');

    expect(erro.message).toBe('Requisição inválida');
    expect(erro.name).toBe('FalhaRequisicao');
    expect(erro.statusCode).toBeUndefined();
  });

  it('deve criar erro com mensagem e status code', () => {
    const erro = new FalhaRequisicao('Requisição inválida', 400);

    expect(erro.message).toBe('Requisição inválida');
    expect(erro.statusCode).toBe(400);
  });
});

describe('FalhaConexao', () => {
  it('deve criar erro com mensagem padrão', () => {
    const erro = new FalhaConexao();

    expect(erro.message).toBe('Falha ao conectar com o servidor');
    expect(erro.name).toBe('FalhaConexao');
  });

  it('deve criar erro com mensagem personalizada', () => {
    const erro = new FalhaConexao('Timeout ao conectar');

    expect(erro.message).toBe('Timeout ao conectar');
    expect(erro.name).toBe('FalhaConexao');
  });
});
