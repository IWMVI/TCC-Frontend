/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TrajeResponse } from '../../domain/entidades';

interface EstadoTrajes {
  trajes: TrajeResponse[];
  trajeSelecionado: TrajeResponse | null;
  estaCarregando: boolean;
  erro: string | null;
  // Paginação
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
  tamanhoPagina: 10,
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
}

const ContextoTrajes = createContext<ContextoTrajesType | undefined>(undefined);

export function ProvedorTrajes({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(trajesReducer, estadoInicial);

  return (
    <ContextoTrajes.Provider value={{ estado, dispatch }}>
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