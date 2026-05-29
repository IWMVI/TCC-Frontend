/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { TrajeRequest, TrajeResponse } from '@domain/entidades';
import { TRAJE_CONSTANTS } from '@application/trajes/TrajeDependencies';
import {
  listarTrajesUseCase,
  atualizarTrajeUseCase,
  deletarTrajeUseCase,
  trajeRepository,
} from '@application/trajes/TrajeDependencies';
import { PaginacaoResultado } from '@infrastructure/api';

interface EstadoTrajes {
  trajes: TrajeResponse[];
  trajeSelecionado: TrajeResponse | null;
  estaCarregando: boolean;
  erro: string | null;
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
}

type AcaoTrajes =
  | { tipo: 'SET_TRAJES'; payload: TrajeResponse[] }
  | { tipo: 'SET_TRAJE_SELECIONADO'; payload: TrajeResponse | null }
  | { tipo: 'ADICIONAR_TRAJE'; payload: TrajeResponse }
  | { tipo: 'ATUALIZAR_TRAJE'; payload: TrajeResponse }
  | { tipo: 'REMOVER_TRAJE'; payload: number }
  | { tipo: 'SET_CARREGANDO'; payload: boolean }
  | { tipo: 'SET_ERRO'; payload: string | null }
  | { tipo: 'SET_PAGINACAO'; payload: { totalPaginas: number; totalRegistros: number; tamanhoPagina: number; paginaAtual: number } };

const estadoInicial: EstadoTrajes = {
  trajes: [],
  trajeSelecionado: null,
  estaCarregando: false,
  erro: null,
  paginaAtual: 0,
  totalPaginas: 0,
  totalRegistros: 0,
  tamanhoPagina: TRAJE_CONSTANTS.TAMANHO_PAGINA_PADRAO,
};

function trajesReducer(estado: EstadoTrajes, acao: AcaoTrajes): EstadoTrajes {
  switch (acao.tipo) {
    case 'SET_TRAJES':
      return { ...estado, trajes: acao.payload };
    case 'SET_TRAJE_SELECIONADO':
      return { ...estado, trajeSelecionado: acao.payload };
    case 'ADICIONAR_TRAJE':
      return { ...estado, trajes: [...estado.trajes, acao.payload] };
    case 'ATUALIZAR_TRAJE':
      return {
        ...estado,
        trajes: estado.trajes.map((t) =>
          t.id === acao.payload.id ? acao.payload : t
        ),
      };
    case 'REMOVER_TRAJE':
      return {
        ...estado,
        trajes: estado.trajes.filter((t) => t.id !== acao.payload),
      };
    case 'SET_CARREGANDO':
      return { ...estado, estaCarregando: acao.payload };
    case 'SET_ERRO':
      return { ...estado, erro: acao.payload };
    case 'SET_PAGINACAO':
      return {
        ...estado,
        totalPaginas: acao.payload.totalPaginas,
        totalRegistros: acao.payload.totalRegistros,
        tamanhoPagina: acao.payload.tamanhoPagina,
        paginaAtual: acao.payload.paginaAtual,
      };
    default:
      return estado;
  }
}

interface ContextoTrajesType {
  estado: EstadoTrajes;
  dispatch: React.Dispatch<AcaoTrajes>;
  carregarTrajes: (busca?: string, pagina?: number) => Promise<void>;
  atualizarTraje: (traje: TrajeResponse) => Promise<void>;
  removerTraje: (id: number) => Promise<void>;
  atualizarImagem: (trajeId: number, file: File) => Promise<string>;
  removerImagem: (trajeId: number) => Promise<void>;
}

const ContextoTrajes = createContext<ContextoTrajesType | undefined>(undefined);

export function ProvedorTrajes({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(trajesReducer, estadoInicial);

  const carregarTrajes = useCallback(
    async (busca?: string, pagina?: number): Promise<void> => {
      dispatch({ tipo: 'SET_CARREGANDO', payload: true });
      dispatch({ tipo: 'SET_ERRO', payload: null });

      try {
        const resultado: PaginacaoResultado<TrajeResponse> = await listarTrajesUseCase.executar(
          busca,
          pagina ?? 0,
          TRAJE_CONSTANTS.TAMANHO_PAGINA_PADRAO
        );

        dispatch({ tipo: 'SET_TRAJES', payload: resultado.content });
        dispatch({
          tipo: 'SET_PAGINACAO',
          payload: {
            totalPaginas: Math.max(resultado.totalPages, 1),
            totalRegistros: resultado.totalElements,
            tamanhoPagina: TRAJE_CONSTANTS.TAMANHO_PAGINA_PADRAO,
            paginaAtual: resultado.number,
          },
        });
      } catch (erro) {
        if (erro instanceof Error && erro.name !== 'AbortError') {
          dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao carregar trajes' });
        }
      } finally {
        dispatch({ tipo: 'SET_CARREGANDO', payload: false });
      }
    },
    []
  );

  const atualizarTraje = useCallback(
    async (traje: TrajeResponse): Promise<void> => {
      try {
        const request: TrajeRequest = {
          nome: traje.nome,
          descricao: traje.descricao,
          tecido: traje.tecido,
          cor: traje.cor,
          estampa: traje.estampa,
          tipo: traje.tipo,
          valorItem: traje.preco,
          tamanho: traje.tamanho,
          textura: traje.textura,
          status: traje.status,
          genero: traje.genero,
          condicao: traje.condicao,
          imagemUrl: traje.imagemUrl,
        };
        const atualizado = await atualizarTrajeUseCase.executar(traje.id, request);
        dispatch({ tipo: 'ATUALIZAR_TRAJE', payload: atualizado });
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao atualizar traje' });
        throw new Error('Erro ao atualizar traje');
      }
    },
    []
  );

  const removerTraje = useCallback(
    async (id: number): Promise<void> => {
      try {
        await deletarTrajeUseCase.executar(id);
        dispatch({ tipo: 'REMOVER_TRAJE', payload: id });
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao remover traje' });
        throw new Error('Erro ao remover traje');
      }
    },
    []
  );

  const atualizarImagem = useCallback(
    async (trajeId: number, file: File): Promise<string> => {
      try {
        const novaUrl = await trajeRepository.atualizarImagem(trajeId, file);
        const trajeAtualizado = estado.trajes.find((t) => t.id === trajeId);
        if (trajeAtualizado) {
          dispatch({
            tipo: 'ATUALIZAR_TRAJE',
            payload: { ...trajeAtualizado, imagem: novaUrl, imagemUrl: novaUrl },
          });
        }
        return novaUrl;
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao atualizar imagem' });
        throw new Error('Erro ao atualizar imagem');
      }
    },
    [estado.trajes]
  );

  const removerImagem = useCallback(
    async (trajeId: number): Promise<void> => {
      try {
        await trajeRepository.removerImagem(trajeId);
        const trajeAtualizado = estado.trajes.find((t) => t.id === trajeId);
        if (trajeAtualizado) {
          dispatch({
            tipo: 'ATUALIZAR_TRAJE',
            payload: { ...trajeAtualizado, imagem: '', imagemUrl: '' },
          });
        }
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao remover imagem' });
        throw new Error('Erro ao remover imagem');
      }
    },
    [estado.trajes]
  );

  const contextoValue = {
    estado,
    dispatch,
    carregarTrajes,
    atualizarTraje,
    removerTraje,
    atualizarImagem,
    removerImagem,
  };

  return (
    <ContextoTrajes.Provider value={contextoValue}>
      {children}
    </ContextoTrajes.Provider>
  );
}

export function useTrajes() {
  const contexto = useContext(ContextoTrajes);
  if (contexto === undefined) {
    throw new Error('useTrajes deve ser usado dentro de um ProvedorTrajes');
  }
  return contexto;
}