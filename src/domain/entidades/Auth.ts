import { FuncionarioResponse } from '@/domain/entidades/Funcionario';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  funcionario: FuncionarioResponse;
}

export interface RegistrarFuncionarioRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface SolicitarRecuperacaoSenhaRequest {
  email: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  senha: string;
}
