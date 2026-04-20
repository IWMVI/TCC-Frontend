import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface EnumValues {
  tecido: string[];
  cor: string[];
  estampa: string[];
  tipoTraje: string[];
  tamanho: string[];
  textura: string[];
  status: string[];
  genero: string[];
  condicao: string[];
  statusAluguel: string[];
  ocasiao: string[];
}

class EnumApiRepository {
  private readonly api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async buscarValoresEnum(): Promise<EnumValues> {
    try {
      const resposta = await this.api.get<EnumValues>('/enums');
      return resposta.data;
    } catch (error) {
      console.error('Erro ao buscar enums:', error);
      return {
        tecido: [],
        cor: [],
        estampa: [],
        tipoTraje: [],
        tamanho: [],
        textura: [],
        status: [],
        genero: [],
        condicao: [],
        statusAluguel: [],
        ocasiao: [],
      };
    }
  }
}

export const enumApiRepository = new EnumApiRepository();
