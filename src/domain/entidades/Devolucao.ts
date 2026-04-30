export enum CondicaoTraje {
  NOVO = 'Novo',
  SEMINOVO = 'Seminovo',
  BOM = 'Bom',
  USADO = 'Usado',
  AVARIADO = 'Avariado',
  EM_MANUTENCAO = 'Em Manutenção',
  INDISPONIVEL = 'Indisponível',
  RESERVADO = 'Reservado',
  ALUGADO = 'Alugado',
  HIGIENIZACAO = 'Higienização',
}

export interface ItemDevolucaoRequest {
  trajeId: number;
  condicao: CondicaoTraje;
}

export interface DevolucaoRequest {
  dataDevolucao: string;
  valorMulta?: number;
  observacoes?: string;
  itens: ItemDevolucaoRequest[];
}

export interface DevolucaoResponse {
  idDevolucao: number;
  dataDevolucao: string;
  observacoes?: string;
  valorMulta?: number;
  idAluguel: number;
}
