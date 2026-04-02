import { FalhaValidacao, RecursoNaoEncontrado, FalhaConexao, FalhaRequisicao } from './index';

describe('Domain Errors', () => {
  describe('FalhaValidacao', () => {
    it('deve criar erro com mensagem padrão sem erros específicos', () => {
      const erro = new FalhaValidacao('Validação falhou');

      expect(erro).toBeInstanceOf(Error);
      expect(erro.message).toBe('Validação falhou');
      expect(erro.name).toBe('FalhaValidacao');
      expect(erro.erros).toEqual({});
    });

    it('deve criar erro com mensagem e objeto de erros', () => {
      const errosCampos = {
        email: ['Email inválido'],
        cpfCnpj: ['CPF já registrado'],
      };

      const erro = new FalhaValidacao('Dados inválidos', errosCampos);

      expect(erro.message).toBe('Dados inválidos');
      expect(erro.erros).toEqual(errosCampos);
      expect(erro.erros.email).toContain('Email inválido');
    });

    it('deve preservar propriedades ao estender Error', () => {
      const erros = { nome: ['Nome obrigatório'] };
      const erro = new FalhaValidacao('Erro', erros);

      expect(erro instanceof FalhaValidacao).toBe(true);
      expect(erro instanceof Error).toBe(true);
    });
  });

  describe('RecursoNaoEncontrado', () => {
    it('deve criar erro com recurso e identificador', () => {
      const erro = new RecursoNaoEncontrado('Cliente', 123);

      expect(erro).toBeInstanceOf(Error);
      expect(erro.message).toBe('Cliente com identificador 123 não encontrado');
      expect(erro.name).toBe('RecursoNaoEncontrado');
      expect(erro.recurso).toBe('Cliente');
      expect(erro.identificador).toBe(123);
    });

    it('deve funcionar com identificador string', () => {
      const erro = new RecursoNaoEncontrado('Usuário', 'admin@email.com');

      expect(erro.message).toContain('Usuário');
      expect(erro.identificador).toBe('admin@email.com');
    });
  });

  describe('FalhaConexao', () => {
    it('deve criar erro de conexão', () => {
      const erro = new FalhaConexao('Servidor indisponível');

      expect(erro).toBeInstanceOf(Error);
      expect(erro.message).toBe('Servidor indisponível');
      expect(erro.name).toBe('FalhaConexao');
    });
  });

  describe('FalhaRequisicao', () => {
    it('deve criar erro de requisição com status', () => {
      const erro = new FalhaRequisicao('Erro na requisição', 500);

      expect(erro).toBeInstanceOf(Error);
      expect(erro.message).toBe('Erro na requisição');
      expect(erro.statusCode).toBe(500);
    });

    it('deve criar erro de requisição sem status', () => {
      const erro = new FalhaRequisicao('Erro genérico');

      expect(erro.message).toBe('Erro genérico');
      expect(erro.statusCode).toBeUndefined();
    });
  });
});
