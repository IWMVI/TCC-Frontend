export enum SiglaEstado {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  bairro: string;
  estado: SiglaEstado;
  complemento?: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  cpfCnpj: string;
  email: string;
  celular: string;
  endereco: Endereco;
  dataCadastro?: string;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj: string;
  email: string;
  celular: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    cidade: string;
    bairro: string;
    estado: string;
    complemento?: string;
  };
}

export interface ClienteResponse {
  id: number;
  nome: string;
  cpfCnpj: string;
  email: string;
  celular: string;
  endereco: Endereco;
  dataCadastro: string;
}
