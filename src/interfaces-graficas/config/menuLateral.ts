import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Shirt,
  UserCog,
  Users,
} from 'lucide-react';

export type DestaqueMenuLateral =
  | 'dashboard'
  | 'alugueis'
  | 'clientes'
  | 'financas'
  | 'funcionarios'
  | 'trajes'
  | 'controle';

export interface SubitemMenuLateral {
  titulo: string;
  rota: string;
}

export interface ItemMenuLateral {
  id: string;
  titulo: string;
  icone: LucideIcon;
  destaque: DestaqueMenuLateral;
  rota?: string;
  filhos?: SubitemMenuLateral[];
}

const MENU_LATERAL_BASE: ItemMenuLateral[] = [
  {
    id: 'dashboard',
    titulo: 'Dashboard',
    icone: LayoutDashboard,
    destaque: 'dashboard',
    rota: '/dashboard',
  },
  {
    id: 'alugueis',
    titulo: 'Aluguéis',
    icone: ClipboardList,
    destaque: 'alugueis',
    filhos: [
      { titulo: 'Adicionar Aluguel', rota: '/alugueis/novo' },
      { titulo: 'Listar Aluguéis', rota: '/alugueis/listar' },
    ],
  },
  {
    id: 'clientes',
    titulo: 'Clientes',
    icone: Users,
    destaque: 'clientes',
    filhos: [
      { titulo: 'Adicionar Cliente', rota: '/clientes/novo' },
      { titulo: 'Listar Clientes', rota: '/clientes/listar' },
    ],
  },
  {
    id: 'financas',
    titulo: 'Finanças',
    icone: DollarSign,
    destaque: 'financas',
    rota: '/financas',
  },
  {
    id: 'funcionarios',
    titulo: 'Funcionários',
    icone: UserCog,
    destaque: 'funcionarios',
    filhos: [
      { titulo: 'Listar funcionários', rota: '/funcionarios/listar' },
      { titulo: 'Novo funcionário', rota: '/funcionarios/novo' },
    ],
  },
  {
    id: 'trajes',
    titulo: 'Trajes',
    icone: Shirt,
    destaque: 'trajes',
    filhos: [
      { titulo: 'Adicionar Traje', rota: '/trajes/novo' },
      { titulo: 'Listar Trajes', rota: '/trajes/listar' },
    ],
  },
];

function ordenarPorTitulo<T extends { titulo: string }>(itens: T[]): T[] {
  return [...itens].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
}

function ordenarMenu(itens: ItemMenuLateral[]): ItemMenuLateral[] {
  const dashboard = itens.find((item) => item.id === 'dashboard');
  const demais = itens
    .filter((item) => item.id !== 'dashboard')
    .map((item) => ({
      ...item,
      filhos: item.filhos ? ordenarPorTitulo(item.filhos) : undefined,
    }));

  const demaisOrdenados = ordenarPorTitulo(demais);

  return dashboard ? [dashboard, ...demaisOrdenados] : demaisOrdenados;
}

export const MENU_LATERAL: ItemMenuLateral[] = ordenarMenu(MENU_LATERAL_BASE);

export function prefixoSecaoMenu(item: ItemMenuLateral): string | null {
  if (item.rota) {
    return item.rota;
  }
  if (item.filhos?.length) {
    const segmento = item.filhos[0].rota.split('/').filter(Boolean)[0];
    return segmento ? `/${segmento}` : null;
  }
  return null;
}

export function secaoMenuAtiva(pathname: string, item: ItemMenuLateral): boolean {
  if (item.rota && !item.filhos?.length) {
    if (item.id === 'dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === item.rota || pathname.startsWith(`${item.rota}/`);
  }

  const prefixo = prefixoSecaoMenu(item);
  if (!prefixo) {
    return false;
  }

  return pathname === prefixo || pathname.startsWith(`${prefixo}/`);
}

export function subitemMenuAtivo(pathname: string, subitem: SubitemMenuLateral): boolean {
  if (pathname === subitem.rota) {
    return true;
  }

  const base = subitem.rota.split('/').filter(Boolean);
  if (base.length < 2) {
    return false;
  }

  const modulo = base[0];
  const acao = base[1];

  if (acao === 'listar') {
    const padraoEdicao = new RegExp(`^/${modulo}/\\d+/editar$`);
    return padraoEdicao.test(pathname);
  }

  return pathname.startsWith(`${subitem.rota}/`);
}
