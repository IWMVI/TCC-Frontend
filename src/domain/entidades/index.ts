export { SiglaEstado } from '@/domain/entidades/Cliente';
export type {
  Cliente,
  ClienteRequest,
  ClienteResponse,
  Endereco,
  MedidaFemininaRequest,
  MedidaMasculinaRequest,
  MedidaFemininaResponse,
  MedidaMasculinaResponse,
} from '@/domain/entidades/Cliente';
export type { Traje, TrajeRequest, TrajeResponse, PeriodoAlugado } from '@/domain/entidades/Traje';
export {StatusAluguel, TipoOcasiao} from '@/domain/entidades/Aluguel';
export type {
  Aluguel,
  AluguelItem,
  AluguelRequest,
	AluguelUpdateRequest,
  AluguelItemRequest,
  AluguelResponse,
} from '@/domain/entidades/Aluguel';
export type { DevolucaoRequest, DevolucaoResponse, ItemDevolucaoRequest } from '@/domain/entidades/Devolucao';
export { CondicaoTraje } from '@/domain/entidades/Devolucao';
