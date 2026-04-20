import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {ArrowLeft, Edit2, Trash2} from 'lucide-react';
import { Botao, Card, Tabela, Modal, Paginacao } from '../../../componentes';
import {
	ListarAlugueisUseCase,
	DeletarAluguemUseCase,
	BuscarAluguelPorIdUseCase,
} from '../../../../application/alugueis';
import { AluguemApiRepository } from '../../../../infrastructure/api';
import {AluguemResponse} from '../../../../domain/entidades';
import {obterAliasTipoOcasiao} from '../utils/ocasiao';
import styles from './ListarAluguel.module.css';

const aluguelRepositorio = new AluguemApiRepository();
const listarAlugueisUseCase = new ListarAlugueisUseCase(aluguelRepositorio);
const deletarAluguemUseCase = new DeletarAluguemUseCase(aluguelRepositorio);
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);

const TAMANHO_PAGINA_PADRAO = 10;

export function ListarAluguel() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const [alugueis, setAluguel] = useState<AluguemResponse[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(TAMANHO_PAGINA_PADRAO);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [aluguelDetalhes, setAluguelDetalhes] = useState<AluguemResponse | null>(null);
  const [aluguelParaExcluir, setAluguelParaExcluir] = useState<AluguemResponse | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const jaCarregouRef = useRef(false);
	
	const carregarAluguel = useCallback(async (busca?: string, pagina?: number) => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;
		
		setEstaCarregando(true);
		try {
			const resultado = await listarAlugueisUseCase.executar(
				busca,
				pagina ?? 0,
				TAMANHO_PAGINA_PADRAO,
			);
			
			if (!signal.aborted) {
				setAluguel(resultado.content);
				setTotalPaginas(resultado.totalPages);
				setTotalRegistros(resultado.totalElements);
				setTamanhoPagina(resultado.size);
				setPaginaAtual(resultado.number);
			}
		} catch (erro) {
			if (erro instanceof Error && erro.name !== 'AbortError') {
				setModalTitulo('Erro');
				setModalMensagem('Erro ao carregar aluguéis');
				setModalAberto(true);
			}
		} finally {
			if (!signal.aborted) {
				setEstaCarregando(false);
			}
		}
	}, []);

  useEffect(() => {
    if (!jaCarregouRef.current) {
      jaCarregouRef.current = true;
      carregarAluguel();
    }
  }, [carregarAluguel]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarAluguel(termoBusca || undefined, 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarAluguel]);

  async function verDetalhes(aluguel: AluguemResponse) {
    try {
      const detalhes = await buscarAluguelPorIdUseCase.executar(aluguel.id);
      setAluguelDetalhes(detalhes);
      setModalDetalhesAberto(true);
    } catch {
      setModalTitulo('Erro');
      setModalMensagem('Erro ao carregar detalhes do aluguel');
      setModalAberto(true);
    }
  }

  function abrirModalExclusao(aluguel: AluguemResponse) {
    setAluguelParaExcluir(aluguel);
    setModalTitulo('Confirmar Exclusão');
    setModalMensagem(`Tem certeza que deseja excluir o aluguel ID ${aluguel.id}?`);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!aluguelParaExcluir) return;

    try {
      await deletarAluguemUseCase.executar(aluguelParaExcluir.id);
      setModalAberto(false);
      carregarAluguel(termoBusca || undefined, paginaAtual);
      setModalTitulo('Sucesso');
      setModalMensagem('Aluguel excluído com sucesso');
      setModalAberto(true);
    } catch {
      setModalTitulo('Erro');
      setModalMensagem('Erro ao excluir aluguel');
      setModalAberto(true);
    } finally {
      setAluguelParaExcluir(null);
    }
  }

  const colunas = [
    { chave: 'id' as keyof AluguemResponse, titulo: 'ID', width: '60px' },
    {
		chave: 'nomeCliente' as keyof AluguemResponse,
		titulo: 'Nome do Cliente',
		render: (aluguel: AluguemResponse) => aluguel.nomeCliente,
    },
    {
      chave: 'dataRetirada' as keyof AluguemResponse,
      titulo: 'Data Retirada',
		render: (aluguel: AluguemResponse) => new Date(aluguel.dataRetirada).toLocaleDateString('pt-BR'),
    },
    {
      chave: 'dataDevolucao' as keyof AluguemResponse,
		titulo: 'Data de Devolução',
		render: (aluguel: AluguemResponse) => new Date(aluguel.dataDevolucao).toLocaleDateString('pt-BR'),
    },
    {
		chave: 'valorTotal' as keyof AluguemResponse,
		titulo: 'Valor Total',
		render: (aluguel: AluguemResponse) => `R$ ${aluguel.valorTotal.toFixed(2)}`,
    },
    {
      chave: 'acoes' as keyof AluguemResponse,
      titulo: 'Ações',
		width: '220px',
      render: (aluguel: AluguemResponse) => (
        <div className={styles['aluguel-acoes']}>
          <button
            type="button"
            className={styles['botao-detalhes']}
            onClick={() => verDetalhes(aluguel)}
            title="Ver detalhes"
          >
            Detalhes
          </button>
          <button
            type="button"
            className={styles['botao-editar']}
            onClick={() => navigate(`/alugueis/${aluguel.id}/editar`)}
            title="Editar aluguel"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className={styles['botao-excluir']}
            onClick={() => abrirModalExclusao(aluguel)}
            title="Excluir aluguel"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles['listar-aluguel']}>
      <header className={styles['listar-aluguel__header']}>
        <div className={styles['listar-aluguel__navegacao']}>
          <button
            type="button"
            className={styles['listar-aluguel__botao-voltar']}
            onClick={() => navigate(-1)}
            title="Voltar para página anterior"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className={styles['listar-aluguel__titulo']}>
            <h1>Aluguéis</h1>
            <p>Gerencie os aluguéis do sistema</p>
          </div>
        </div>
        <div className={styles['listar-aluguel__acoes-header']}>
          <Link to="/alugueis/novo">
            <Botao>Novo Aluguel</Botao>
          </Link>
        </div>
      </header>

      <Card titulo="Lista de Aluguéis">
        <div className={styles['listar-aluguel__conteudo']}>
          <div className={styles['listar-aluguel__busca']}>
            <input
              type="text"
              placeholder="Buscar por nome do cliente ou ID..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className={styles['listar-aluguel__input-busca']}
            />
          </div>

          {estaCarregando ? (
            <p className={styles['listar-aluguel__mensagem']}>Carregando...</p>
          ) : alugueis.length === 0 ? (
            <p className={styles['listar-aluguel__mensagem']}>Nenhum aluguel encontrado</p>
          ) : (
            <>
              <Tabela colunas={colunas} dados={alugueis} />
              <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalRegistros={totalRegistros}
                tamanhoPagina={tamanhoPagina}
                onPageChange={(pagina) => carregarAluguel(termoBusca || undefined, pagina)}
              />
            </>
          )}
        </div>
      </Card>

      <Modal
        titulo={modalTitulo}
        mensagem={modalMensagem}
        estaAberto={modalAberto}
        aoConfirmar={modalTitulo === 'Confirmar Exclusão' ? confirmarExclusao : () => setModalAberto(false)}
        aoCancelar={() => {
          setModalAberto(false);
          setAluguelParaExcluir(null);
        }}
        textoBotaoConfirmar={modalTitulo === 'Confirmar Exclusão' ? 'Excluir' : 'Ok'}
        textoBotaoCancelar="Fechar"
        tipoBotaoConfirmar={modalTitulo === 'Confirmar Exclusao' ? 'perigo' : 'primario'}
      />

      {modalDetalhesAberto && aluguelDetalhes && (
        <div className={styles['modal-overlay']}>
          <Card titulo="Detalhes do Aluguel">
            <div className={styles['modal-detalhes']}>
              <div className={styles['detalhes-secao']}>
                <h3>Informações do Aluguel</h3>
                <p>
                  <strong>ID:</strong> {aluguelDetalhes.id}
                </p>
                <p>
					<strong>Cliente ID:</strong> {aluguelDetalhes.clienteId}
				</p>
				  <p>
					  <strong>Nome do Cliente:</strong> {aluguelDetalhes.nomeCliente}
                </p>
                <p>
					<strong>Data Retirada:</strong> {new Date(aluguelDetalhes.dataRetirada).toLocaleDateString('pt-BR')}
                </p>
                <p>
					<strong>Data de
		                Devolução:</strong> {new Date(aluguelDetalhes.dataDevolucao).toLocaleDateString('pt-BR')}
                </p>
                <p>
					<strong>Ocasião:</strong> {obterAliasTipoOcasiao(aluguelDetalhes.ocasiao)}
                </p>
                <p>
                  <strong>Status:</strong> {aluguelDetalhes.status}
                </p>
              </div>
				
				{aluguelDetalhes.itens?.length > 0 && (
                <div className={styles['detalhes-secao']}>
					<h3>Itens do Aluguel</h3>
					{aluguelDetalhes.itens.map((item, index) => (
						<div key={`${item.trajeId}-${index}`} className={styles['item-aluguel']}>
                      <p>
						  <strong>{item.nomeTraje}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles['detalhes-secao']}>
                <h3>Resumo Financeiro</h3>
                <p>
					<strong>Valor Desconto:</strong> R$ {(aluguelDetalhes.valorDesconto ?? 0).toFixed(2)}
                </p>
				  <p className={styles.total}>
					  <strong>Valor Total:</strong> R$ {aluguelDetalhes.valorTotal.toFixed(2)}
                </p>
              </div>

              <div className={styles['modal-acoes']}>
                <Botao onClick={() => setModalDetalhesAberto(false)}>Fechar</Botao>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
