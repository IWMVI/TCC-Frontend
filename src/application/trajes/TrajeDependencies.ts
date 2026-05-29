import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { TrajeApiRepository } from '@infrastructure/api';
import { ITrajeRepository } from '@domain/interfaces';
import { ListarTrajesUseCase } from '@/application/trajes/ListarTrajesUseCase';
import { BuscarTrajePorIdUseCase } from '@/application/trajes/BuscarTrajePorIdUseCase';
import { CriarTrajeUseCase } from '@/application/trajes/CriarTrajeUseCase';
import { AtualizarTrajeUseCase } from '@/application/trajes/AtualizarTrajeUseCase';
import { DeletarTrajeUseCase } from '@/application/trajes/DeletarTrajeUseCase';

const trajeRepository: ITrajeRepository = new TrajeApiRepository();

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
  TAMANHO_PAGINA_PADRAO,
  DEBOUNCE_DELAY_MS: 300,
  ROUTES: {
    LISTAR: '/trajes/listar',
    CRIAR: '/trajes/novo',
    EDITAR: (id: number | string) => `/trajes/${id}/editar`,
    LISTA: '/trajes',
  },
} as const;
