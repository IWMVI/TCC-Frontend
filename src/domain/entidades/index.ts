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
export type {
  FuncionarioRequest,
  FuncionarioResponse,
  FuncionarioUpdateRequest,
} from '@/domain/entidades/Funcionario';
export type {
  LoginRequest,
  LoginResponse,
  RegistrarFuncionarioRequest,
  SolicitarRecuperacaoSenhaRequest,
  RedefinirSenhaRequest,
} from '@/domain/entidades/Auth';
export type {
  DashboardResumo,
  AluguelResumoItem,
  SerieMensalDashboard,
} from '@/domain/entidades/Dashboard';
export type { FinancasResumo, FinancasPorStatus } from '@/domain/entidades/Financas';
