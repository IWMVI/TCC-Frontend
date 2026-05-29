export interface FuncionarioResponse {
  id: number;
  nome: string;
  email: string;
  emailVerificado: boolean;
  ativo: boolean;
  criadoEm: string;
}

export interface FuncionarioRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface FuncionarioUpdateRequest {
  nome: string;
  email: string;
  senha?: string;
}
