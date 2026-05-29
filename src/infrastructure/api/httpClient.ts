import axios, { AxiosInstance, isAxiosError } from 'axios';

export const TOKEN_STORAGE_KEY = 'tcc_token';
export const FUNCIONARIO_STORAGE_KEY = 'tcc_funcionario';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(FUNCIONARIO_STORAGE_KEY);
      const rotaAtual = window.location.pathname;
      if (rotaAtual !== '/login' && rotaAtual !== '/confirmar-email') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function obterBaseUrl(): string {
  return API_BASE_URL;
}
