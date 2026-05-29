import { httpClient } from '@/infrastructure/api/httpClient';

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
  async buscarValoresEnum(): Promise<EnumValues> {
    try {
      const resposta = await httpClient.get<EnumValues>('/enums');
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
