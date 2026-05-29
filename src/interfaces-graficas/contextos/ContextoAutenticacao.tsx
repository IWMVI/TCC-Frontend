import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { FuncionarioResponse } from '@/domain/entidades/Funcionario';
import { LoginRequest } from '@/domain/entidades/Auth';
import { LoginUseCase } from '@/application/auth';
import { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository';
import {
  FUNCIONARIO_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '@/infrastructure/api/httpClient';

interface ContextoAutenticacaoValor {
  funcionario: FuncionarioResponse | null;
  autenticado: boolean;
  carregando: boolean;
  login: (dados: LoginRequest) => Promise<void>;
  logout: () => void;
}

const ContextoAutenticacao = createContext<ContextoAutenticacaoValor | null>(null);

const authRepositorio = new AuthApiRepository();
const loginUseCase = new LoginUseCase(authRepositorio);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [funcionario, setFuncionario] = useState<FuncionarioResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const funcionarioSalvo = localStorage.getItem(FUNCIONARIO_STORAGE_KEY);
    if (token && funcionarioSalvo) {
      try {
        setFuncionario(JSON.parse(funcionarioSalvo) as FuncionarioResponse);
      } catch {
        localStorage.removeItem(FUNCIONARIO_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
    setCarregando(false);
  }, []);

  const login = useCallback(async (dados: LoginRequest) => {
    const resposta = await loginUseCase.executar(dados);
    localStorage.setItem(TOKEN_STORAGE_KEY, resposta.token);
    localStorage.setItem(
      FUNCIONARIO_STORAGE_KEY,
      JSON.stringify(resposta.funcionario),
    );
    setFuncionario(resposta.funcionario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(FUNCIONARIO_STORAGE_KEY);
    setFuncionario(null);
  }, []);

  const valor = useMemo(
    () => ({
      funcionario,
      autenticado: funcionario !== null,
      carregando,
      login,
      logout,
    }),
    [funcionario, carregando, login, logout],
  );

  return (
    <ContextoAutenticacao.Provider value={valor}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao(): ContextoAutenticacaoValor {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
  }
  return contexto;
}
