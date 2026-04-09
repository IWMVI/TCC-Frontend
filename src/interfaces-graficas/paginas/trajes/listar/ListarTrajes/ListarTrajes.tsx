import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Botao, Card, Tabela, Modal, Busca, Paginacao } from '../../../../componentes';
import { useTrajes } from '../../../../contextos/ContextoTrajes';
import { ListarTrajesUseCase, DeletarTrajeUseCase } from '../../../../../application/trajes';
import { TrajeApiRepository } from '../../../../../infrastructure/api';
import { TrajeResponse } from '../../../../../domain/entidades';
import styles from './ListarTrajes.module.css';

// TODO: mudar as propriedades do traje depois para o que foi definido no prototipo HI-FI, e o formulário irá ser atualizado para refletir essas mudanças.

const trajeRepositorio = new TrajeApiRepository();
const listarTrajesUseCase = new ListarTrajesUseCase(trajeRepositorio);
const deletarTrajeUseCase = new DeletarTrajeUseCase(trajeRepositorio);

const TAMANHO_PAGINA_PADRAO = 10;

export function ListarTrajes() {
  const { estado, dispatch } = useTrajes();
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [trajeParaExcluir, setTrajeParaExcluir] = useState<TrajeResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const jaCarregouRef = useRef(false);

  const carregarTrajes = useCallback(
    async (busca?: string, pagina?: number) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      dispatch({ tipo: 'SET_CARREGANDO', payload: true });
      dispatch({ tipo: 'SET_ERRO', payload: null });

      try {
        const resultado = await listarTrajesUseCase.executar(
          busca,
          pagina ?? 0,
          TAMANHO_PAGINA_PADRAO
        );

        if (!signal.aborted) {
          dispatch({ tipo: 'SET_TRAJES', payload: resultado.content });
          dispatch({
            tipo: 'SET_PAGINACAO',
            payload: {
              totalPaginas: resultado.totalPages,
              totalRegistros: resultado.totalElements,
              tamanhoPagina: resultado.size,
              paginaAtual: resultado.number,
            },
          });
        }
      } catch (erro) {
        if (erro instanceof Error && erro.name !== 'AbortError') {
          dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao carregar trajes' });
        }
      } finally {
        if (!signal.aborted) {
          dispatch({ tipo: 'SET_CARREGANDO', payload: false });
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!jaCarregouRef.current) {
      jaCarregouRef.current = true;
      carregarTrajes();
    }
  }, [carregarTrajes]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarTrajes(termoBusca || undefined, 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarTrajes]);

  function abrirModalExclusao(traje: TrajeResponse) {
    setTrajeParaExcluir(traje);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTrajeParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!trajeParaExcluir) return;

    setEstaExcluindo(true);
    try {
      await deletarTrajeUseCase.executar(trajeParaExcluir.id);
      dispatch({ tipo: 'REMOVER_TRAJE', payload: trajeParaExcluir.id });
      fecharModal();
      carregarTrajes(termoBusca || undefined, estado.paginaAtual);
    } catch {
      dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao excluir traje' });
    } finally {
      setEstaExcluindo(false);
    }
  }

  function handlePageChange(pagina: number) {
    carregarTrajes(termoBusca || undefined, pagina);
  }

  function handleVoltar() {
    navigate(-1);
  }

  const colunas = [
    { chave: 'id' as keyof TrajeResponse, titulo: 'ID', width: '60px' },
    { chave: 'nome' as keyof TrajeResponse, titulo: 'Nome' },
    { chave: 'tamanho' as keyof TrajeResponse, titulo: 'Tamanho' },
    { chave: 'cor' as keyof TrajeResponse, titulo: 'Cor' },
    {
      chave: 'preco' as keyof TrajeResponse,
      titulo: 'Preço',
      render: (traje: TrajeResponse) =>
        traje.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      chave: 'acoes' as keyof TrajeResponse,
      titulo: 'Ações',
      width: '180px',
      render: (traje: TrajeResponse) => (
        <div className={styles['listar-trajes__acoes']}>
          <Link
            to={`/trajes/${traje.id}/editar`}
            className={styles['listar-trajes__botao-editar']}
            title="Editar traje"
          >
            Editar
          </Link>
          <button
            type="button"
            className={styles['listar-trajes__botao-excluir']}
            onClick={() => abrirModalExclusao(traje)}
            title="Excluir traje"
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles['listar-trajes']}>
      <header className={styles['listar-trajes__header']}>
        <div className={styles['listar-trajes__navegacao']}>
          <button
            type="button"
            className={styles['listar-trajes__botao-voltar']}
            onClick={handleVoltar}
            title="Voltar para página anterior"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className={styles['listar-trajes__titulo']}>
            <h1>Trajes</h1>
            <p>Gerencie os trajes do sistema</p>
          </div>
        </div>
        <div className={styles['listar-trajes__acoes-header']}>
          <Link to="/trajes/novo">
            <Botao>Novo Traje</Botao>
          </Link>
        </div>
      </header>

      <Card titulo="Lista de Trajes">
        <div className={styles.card__conteudo}>
          <div className={styles.card__corpo}>
            <div className={styles['listar-trajes__busca']}>
              <Busca
                valor={termoBusca}
                onChange={setTermoBusca}
                placeholder="Buscar por nome, tamanho ou cor..."
                onSearch={(valor) => carregarTrajes(valor || undefined, 0)}
              />
            </div>

            {estado.erro && <div className={styles['listar-trajes__erro']}>{estado.erro}</div>}

            <div className={styles['listar-trajes__tabela-wrapper']}>
              <Tabela colunas={colunas} dados={estado.trajes} estaCarregando={estado.estaCarregando} />
            </div>
          </div>

          <div className={styles['listar-trajes__paginacao-container']}>
            <Paginacao
              paginaAtual={estado.paginaAtual}
              totalPaginas={estado.totalPaginas || 1}
              totalRegistros={estado.totalRegistros}
              tamanhoPagina={estado.tamanhoPagina}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>

      <Modal
        titulo="Confirmar Exclusão"
        mensagem={`Tem certeza que deseja excluir o traje "${trajeParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
        estaAberto={modalAberto}
        aoConfirmar={confirmarExclusao}
        aoCancelar={fecharModal}
        textoBotaoConfirmar={estaExcluindo ? 'Excluindo...' : 'Excluir'}
        textoBotaoCancelar="Cancelar"
        tipoBotaoConfirmar="perigo"
      />
    </div>
  );
}
