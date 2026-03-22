export class FalhaValidacao extends Error {
  public readonly erros: Record<string, string[]>;

  constructor(mensagem: string, erros: Record<string, string[]> = {}) {
    super(mensagem);
    this.name = 'FalhaValidacao';
    this.erros = erros;
  }
}

export class RecursoNaoEncontrado extends Error {
  public readonly recurso: string;
  public readonly identificador: string | number;

  constructor(recurso: string, identificador: string | number) {
    super(`${recurso} com identificador ${identificador} não encontrado`);
    this.name = 'RecursoNaoEncontrado';
    this.recurso = recurso;
    this.identificador = identificador;
  }
}

export class FalhaRequisicao extends Error {
  public readonly statusCode?: number;

  constructor(mensagem: string, statusCode?: number) {
    super(mensagem);
    this.name = 'FalhaRequisicao';
    this.statusCode = statusCode;
  }
}

export class FalhaConexao extends Error {
  constructor(mensagem: string = 'Falha ao conectar com o servidor') {
    super(mensagem);
    this.name = 'FalhaConexao';
  }
}
