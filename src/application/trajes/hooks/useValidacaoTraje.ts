import { useCallback } from 'react';
import { TrajeRequest } from '@domain/entidades';

type ErrosValidacao = Partial<Record<keyof TrajeRequest, string>>;

interface UseValidacaoTrajeReturn {
  erros: ErrosValidacao;
  validar: (dados: TrajeRequest) => boolean;
  limparErros: (campo?: keyof TrajeRequest) => void;
}

const MENSAGENS_VALIDACAO = {
  nomeObrigatorio: 'Nome é obrigatório',
  descricaoObrigatoria: 'Descrição é obrigatória',
  tecidoObrigatorio: 'Tecido é obrigatório',
  tipoObrigatorio: 'Tipo do traje é obrigatório',
  tamanhoObrigatorio: 'Tamanho é obrigatório',
  corObrigatoria: 'Cor é obrigatória',
  texturaObrigatoria: 'Textura é obrigatória',
  statusObrigatorio: 'Status é obrigatório',
  sexoObrigatorio: 'Sexo é obrigatório',
  condicaoObrigatoria: 'Condição é obrigatória',
  precoInvalido: 'Preço deve ser maior que zero',
} as const;

export function useValidacaoTraje(): UseValidacaoTrajeReturn {
  const validar = useCallback((dados: TrajeRequest): boolean => {
    const erros: ErrosValidacao = {};

    if (!dados.nome?.trim()) {
      erros.nome = MENSAGENS_VALIDACAO.nomeObrigatorio;
    }

    if (!dados.descricao?.trim()) {
      erros.descricao = MENSAGENS_VALIDACAO.descricaoObrigatoria;
    }

    if (!dados.tecido) {
      erros.tecido = MENSAGENS_VALIDACAO.tecidoObrigatorio;
    }

    if (!dados.tipo) {
      erros.tipo = MENSAGENS_VALIDACAO.tipoObrigatorio;
    }

    if (!dados.tamanho) {
      erros.tamanho = MENSAGENS_VALIDACAO.tamanhoObrigatorio;
    }

    if (!dados.cor) {
      erros.cor = MENSAGENS_VALIDACAO.corObrigatoria;
    }

    if (!dados.textura) {
      erros.textura = MENSAGENS_VALIDACAO.texturaObrigatoria;
    }

    if (!dados.status) {
      erros.status = MENSAGENS_VALIDACAO.statusObrigatorio;
    }

    if (!dados.genero) {
      erros.genero = MENSAGENS_VALIDACAO.sexoObrigatorio;
    }

    if (!dados.condicao) {
      erros.condicao = MENSAGENS_VALIDACAO.condicaoObrigatoria;
    }

    if (dados.valorItem <= 0) {
      erros.valorItem = MENSAGENS_VALIDACAO.precoInvalido;
    }

    return Object.keys(erros).length === 0;
  }, []);

  const limparErros = useCallback((_campo?: keyof TrajeRequest) => {
    // This will be handled by the component using this hook
  }, []);

  return {
    erros: {},
    validar,
    limparErros,
  };
}
