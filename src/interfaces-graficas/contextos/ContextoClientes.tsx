import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ClienteResponse } from '../../domain/entidades';

interface EstadoClientes {
  clientes: ClienteResponse[];
  clienteSelecionado: ClienteResponse | null;
  estaCarregando: boolean;
  erro: string | null;
  // Paginação
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
}

type AcaoClientes =
  | { tipo: 'SET_CLIENTES'; payload: ClienteResponse[] }
  | { tipo: 'SET_CLIENTE_SELECIONADO'; payload: ClienteResponse | null }
  | { tipo: 'ADICIONAR_CLIENTE'; payload: ClienteResponse }
  | { tipo: 'ATUALIZAR_CLIENTE'; payload: ClienteResponse }
  | { tipo: 'REMOVER_CLIENTE'; payload: number }
  | { tipo: 'SET_CARREGANDO'; payload: boolean }
  | { tipo: 'SET_ERRO'; payload: string | null }
  | { tipo: 'SET_PAGINACAO'; payload: { totalPaginas: number; totalRegistros: number; tamanhoPagina: number; paginaAtual: number } };

const estadoInicial: EstadoClientes = {
  clientes: [],
  clienteSelecionado: null,
  estaCarregando: false,
  erro: null,
  paginaAtual: 0,
  totalPaginas: 0,
  totalRegistros: 0,
  tamanhoPagina: 10,
};

function clientesReducer(estado: EstadoClientes, acao: AcaoClientes): EstadoClientes {
  switch (acao.tipo) {
    case 'SET_CLIENTES':
      return { ...estado, clientes: acao.payload };
    case 'SET_CLIENTE_SELECIONADO':
      return { ...estado, clienteSelecionado: acao.payload };
    case 'ADICIONAR_CLIENTE':
      return { ...estado, clientes: [...estado.clientes, acao.payload] };
    case 'ATUALIZAR_CLIENTE':
      return {
        ...estado,
        clientes: estado.clientes.map((c) =>
          c.id === acao.payload.id ? acao.payload : c
        ),
      };
    case 'REMOVER_CLIENTE':
      return {
        ...estado,
        clientes: estado.clientes.filter((c) => c.id !== acao.payload),
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

interface ContextoClientesType {
  estado: EstadoClientes;
  dispatch: React.Dispatch<AcaoClientes>;
}

const ContextoClientes = createContext<ContextoClientesType | undefined>(undefined);

export function ProvedorClientes({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(clientesReducer, estadoInicial);

  return (
    <ContextoClientes.Provider value={{ estado, dispatch }}>
      {children}
    </ContextoClientes.Provider>
  );
}

export function useClientes() {
  const contexto = useContext(ContextoClientes);
  if (contexto === undefined) {
    throw new Error('useClientes deve ser usado dentro de um ProvedorClientes');
  }
  return contexto;
}
