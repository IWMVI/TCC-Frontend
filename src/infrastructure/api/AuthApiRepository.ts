import { IAuthRepository } from '@domain/interfaces/IAuthRepository';
import {
  LoginRequest,
  LoginResponse,
  RedefinirSenhaRequest,
  RegistrarFuncionarioRequest,
} from '@/domain/entidades/Auth';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';
import { httpClient } from '@/infrastructure/api/httpClient';
import { tratarErroApi } from '@/infrastructure/api/apiErrorHandler';

export class AuthApiRepository implements IAuthRepository {
  async login(dados: LoginRequest): Promise<LoginResponse> {
    try {
      const resposta = await httpClient.post<LoginResponse>('/auth/login', dados);
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async registrar(dados: RegistrarFuncionarioRequest): Promise<FuncionarioResponse> {
    try {
      const resposta = await httpClient.post<FuncionarioResponse>(
        '/auth/registrar',
        dados,
      );
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async confirmarEmail(token: string): Promise<FuncionarioResponse> {
    try {
      const resposta = await httpClient.get<FuncionarioResponse>(
        '/auth/confirmar-email',
        { params: { token } },
      );
      return resposta.data;
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async reenviarConfirmacao(email: string): Promise<void> {
    try {
      await httpClient.post('/auth/reenviar-confirmacao', { email });
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    try {
      await httpClient.post('/auth/recuperar-senha', { email });
    } catch (erro) {
      tratarErroApi(erro);
    }
  }

  async redefinirSenha(dados: RedefinirSenhaRequest): Promise<void> {
    try {
      await httpClient.post('/auth/redefinir-senha', dados);
    } catch (erro) {
      tratarErroApi(erro);
    }
  }
}
