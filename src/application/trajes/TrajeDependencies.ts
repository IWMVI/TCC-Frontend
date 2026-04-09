import { TrajeApiRepository } from '@infrastructure/api';
import { ITrajeRepository } from '@domain/interfaces';
import { ListarTrajesUseCase } from './ListarTrajesUseCase';
import { BuscarTrajePorIdUseCase } from './BuscarTrajePorIdUseCase';
import { CriarTrajeUseCase } from './CriarTrajeUseCase';
import { AtualizarTrajeUseCase } from './AtualizarTrajeUseCase';
import { DeletarTrajeUseCase } from './DeletarTrajeUseCase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const trajeRepository: ITrajeRepository = new TrajeApiRepository(API_BASE_URL);

const listarTrajesUseCase = new ListarTrajesUseCase(trajeRepository);
const buscarTrajePorIdUseCase = new BuscarTrajePorIdUseCase(trajeRepository);
const criarTrajeUseCase = new CriarTrajeUseCase(trajeRepository);
const atualizarTrajeUseCase = new AtualizarTrajeUseCase(trajeRepository);
const deletarTrajeUseCase = new DeletarTrajeUseCase(trajeRepository);

export {
  trajeRepository,
  listarTrajesUseCase,
  buscarTrajePorIdUseCase,
  criarTrajeUseCase,
  atualizarTrajeUseCase,
  deletarTrajeUseCase,
};

export const TRAJE_CONSTANTS = {
  TAMANHO_PAGINA_PADRAO: 10,
  DEBOUNCE_DELAY_MS: 300,
  ROUTES: {
    LISTAR: '/trajes/listar',
    CRIAR: '/trajes/novo',
    EDITAR: (id: number | string) => `/trajes/${id}/editar`,
    LISTA: '/trajes',
  },
} as const;
