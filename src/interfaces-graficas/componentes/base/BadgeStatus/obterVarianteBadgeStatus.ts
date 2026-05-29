export type VarianteBadgeStatus = 'sucesso' | 'aviso' | 'erro' | 'neutro' | 'info';

const ROTULOS_STATUS: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  'em atraso': 'Em Atraso',
  atraso: 'Em Atraso',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  disponivel: 'Disponível',
  alugado: 'Alugado',
  reservado: 'Reservado',
  limpeza: 'Limpeza',
  manutencao: 'Manutenção',
  danificado: 'Danificado',
  'em conferencia': 'Em conferência',
  bloqueado: 'Bloqueado',
};

const VARIANTE_POR_CHAVE: Record<string, VarianteBadgeStatus> = {
  ativo: 'sucesso',
  inativo: 'neutro',
  'em atraso': 'aviso',
  atraso: 'aviso',
  concluido: 'neutro',
  cancelado: 'erro',
  disponivel: 'sucesso',
  alugado: 'info',
  reservado: 'info',
  limpeza: 'aviso',
  manutencao: 'aviso',
  danificado: 'erro',
  'em conferencia': 'aviso',
  bloqueado: 'erro',
};

function normalizarStatus(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function obterRotuloBadgeStatus(status: string): string {
  const chave = normalizarStatus(status);
  return ROTULOS_STATUS[chave] ?? status;
}

export function obterVarianteBadgeStatus(status: string): VarianteBadgeStatus {
  const chave = normalizarStatus(status);
  return VARIANTE_POR_CHAVE[chave] ?? 'neutro';
}
