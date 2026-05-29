import {
  LoginRequest,
  LoginResponse,
  RedefinirSenhaRequest,
  RegistrarFuncionarioRequest,
} from '@/domain/entidades/Auth';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';

export interface IAuthRepository {
  login(dados: LoginRequest): Promise<LoginResponse>;
  registrar(dados: RegistrarFuncionarioRequest): Promise<FuncionarioResponse>;
  confirmarEmail(token: string): Promise<FuncionarioResponse>;
  reenviarConfirmacao(email: string): Promise<void>;
  solicitarRecuperacaoSenha(email: string): Promise<void>;
  redefinirSenha(dados: RedefinirSenhaRequest): Promise<void>;
}
