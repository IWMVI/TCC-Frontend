export { ListarTrajesUseCase } from '@/application/trajes/ListarTrajesUseCase';
export { CriarTrajeUseCase } from '@/application/trajes/CriarTrajeUseCase';
export { AtualizarTrajeUseCase } from '@/application/trajes/AtualizarTrajeUseCase';
export { DeletarTrajeUseCase } from '@/application/trajes/DeletarTrajeUseCase';
export { BuscarTrajePorIdUseCase } from '@/application/trajes/BuscarTrajePorIdUseCase';
export {
  trajeRepository,
  listarTrajesUseCase,
  buscarTrajePorIdUseCase,
  criarTrajeUseCase,
  atualizarTrajeUseCase,
  deletarTrajeUseCase,
  TRAJE_CONSTANTS,
} from '@/application/trajes/TrajeDependencies';