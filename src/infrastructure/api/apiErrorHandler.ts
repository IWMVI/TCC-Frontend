import { isAxiosError } from 'axios';
import { FalhaConexao, FalhaRequisicao, RecursoNaoEncontrado } from '@domain/erros';

export function tratarErroApi(erro: unknown): never {
  if (isAxiosError(erro)) {
    if (!erro.response) {
      throw new FalhaConexao();
    }
    const mensagem =
      (erro.response.data as { message?: string })?.message ??
      'Erro ao processar requisição';
    if (erro.response.status === 404) {
      throw new RecursoNaoEncontrado('Recurso', 0);
    }
    throw new FalhaRequisicao(mensagem, erro.response.status);
  }
  throw erro;
}
