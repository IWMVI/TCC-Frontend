export interface DevolucaoRequest {
  dataDevolucao: string;
  valorMulta?: number;
  observacoes?: string;
}

export interface DevolucaoResponse {
  idDevolucao: number;
  dataDevolucao: string;
  observacoes?: string;
  valorMulta?: number;
  idAluguel: number;
}
