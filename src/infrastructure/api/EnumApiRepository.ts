import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface EnumValues {
  tecido: string[];
  cor: string[];
  estampa: string[];
  tipoTraje: string[];
  tamanho: string[];
  textura: string[];
  status: string[];
  sexo: string[];
  condicao: string[];
}

class EnumApiRepository {
  private readonly api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async buscarValoresEnum(): Promise<EnumValues> {
    const resposta = await this.api.get<EnumValues>('/enums');
    return resposta.data;
  }
}

export const enumApiRepository = new EnumApiRepository();
