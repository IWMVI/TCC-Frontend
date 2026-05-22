import {
  Botao,
  Calendario,
  Card,
  Modal,
  Paginacao,
  Tabela,
} from '@/interfaces-graficas/componentes';
import { FormularioDevolucao } from '@/interfaces-graficas/paginas/alugueis/devolver/FormularioDevolucao';
import styles from '@/interfaces-graficas/paginas/alugueis/listar/ListarAluguel.module.css';
import { obterAliasTipoOcasiao } from '@/interfaces-graficas/paginas/alugueis/utils/ocasiao';
import {
  BuscarAluguelPorIdUseCase,
  DeletarAluguelUseCase,
  GerarContratoAluguelUseCase,
  ListarAlugueisUseCase,
} from '@application/alugueis';
import { ResumoFinanceiroAluguel } from '@/interfaces-graficas/paginas/alugueis/componentes/ResumoFinanceiroAluguel';
import { calcularResumoFinanceiroDeAluguel } from '@/interfaces-graficas/paginas/alugueis/utils/resumoFinanceiro';
import { statusPermiteDevolucao } from '@/interfaces-graficas/paginas/alugueis/utils/status';
import { AluguelResponse, StatusAluguel, TipoOcasiao } from '@domain/entidades';
import { FiltrosAluguel } from '@domain/interfaces';
import { AluguelApiRepository } from '@infrastructure/api';
import {
  ArrowLeft,
  Edit2,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const aluguelRepositorio = new AluguelApiRepository();
const listarAlugueisUseCase = new ListarAlugueisUseCase(aluguelRepositorio);
const deletarAluguelUseCase = new DeletarAluguelUseCase(aluguelRepositorio);
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);
const gerarContratoUseCase = new GerarContratoAluguelUseCase(aluguelRepositorio);

const TAMANHO_PAGINA_PADRAO = 10;

export function ListarAluguel() {
  const navigate = useNavigate();
  const [alugueis, setAluguel] = useState<AluguelResponse[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(TAMANHO_PAGINA_PADRAO);

  // Filter panel state (Task 13.1)
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAluguel>({ status: StatusAluguel.ATIVO });

  // Devolver modal state (Task 13.3)
  const [modalDevolucaoAberto, setModalDevolucaoAberto] = useState(false);
  const [aluguelParaDevolver, setAluguelParaDevolver] = useState<AluguelResponse | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [aluguelDetalhes, setAluguelDetalhes] = useState<AluguelResponse | null>(null);
  const [aluguelParaExcluir, setAluguelParaExcluir] = useState<AluguelResponse | null>(null);
  const [alertaSucesso, setAlertaSucesso] = useState<string | null>(null);
  const [alertaErro, setAlertaErro] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const filtrosRef = useRef<FiltrosAluguel>(filtros);
  filtrosRef.current = filtros;

  useEffect(() => {
    if (alertaSucesso || alertaErro) {
      const timer = setTimeout(() => {
        setAlertaSucesso(null);
        setAlertaErro(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaSucesso, alertaErro]);

  // Task 13.2: refactored to use executarComFiltros
  const carregarAluguel = useCallback(async (filtrosParam?: FiltrosAluguel, pagina?: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setEstaCarregando(true);
    try {
      const resultado = await listarAlugueisUseCase.executarComFiltros(
        filtrosParam ?? filtrosRef.current,
        pagina ?? 0,
        TAMANHO_PAGINA_PADRAO
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
        setAlertaErro('Erro ao carregar aluguéis');
      }
    } finally {
      if (!signal.aborted) {
        setEstaCarregando(false);
      }
    }
  }, []);

  function buscarComFiltros(filtrosParam: FiltrosAluguel) {
    setPainelFiltrosAberto(false);
    carregarAluguel(filtrosParam, 0);
  }

  // Task 13.2: initialize with ATIVO status on mount
  useEffect(() => {
    carregarAluguel({ status: StatusAluguel.ATIVO });
  }, [carregarAluguel]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  async function verDetalhes(aluguel: AluguelResponse) {
    try {
      const detalhes = await buscarAluguelPorIdUseCase.executar(aluguel.id);
      setAluguelDetalhes(detalhes);
      setModalDetalhesAberto(true);
    } catch {
      setAlertaErro('Erro ao carregar detalhes do aluguel');
    }
  }

  async function gerarContrato(aluguel: AluguelResponse) {
    try {
      const blob = await gerarContratoUseCase.executar(aluguel.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setAlertaErro('Erro ao gerar contrato');
    }
  }

  function abrirModalExclusao(aluguel: AluguelResponse) {
    setAluguelParaExcluir(aluguel);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!aluguelParaExcluir) return;

    try {
      await deletarAluguelUseCase.executar(aluguelParaExcluir.id);
      setModalAberto(false);
      setAlertaSucesso('Aluguel excluído com sucesso');
      carregarAluguel(filtros, paginaAtual);
    } catch {
      setModalAberto(false);
      setAlertaErro('Não foi possível excluir o aluguel. Tente novamente mais tarde.');
    } finally {
      setAluguelParaExcluir(null);
    }
  }

  // Task 13.3: open devolver modal
  function abrirModalDevolucao(aluguel: AluguelResponse) {
    setAluguelParaDevolver(aluguel);
    setModalDevolucaoAberto(true);
  }

  // Task 13.3: on success, close modal, show message, reload list
  function handleDevolucaoSucesso() {
    setModalDevolucaoAberto(false);
    setAluguelParaDevolver(null);
    setAlertaSucesso('Devolução registrada com sucesso');
    carregarAluguel(filtros, paginaAtual);
  }

  // Task 13.3: on cancel, close modal
  function handleDevolucaoCancelar() {
    setModalDevolucaoAberto(false);
    setAluguelParaDevolver(null);
  }

  const colunas = [
    { chave: 'id' as keyof AluguelResponse, titulo: 'ID', align: 'center' as const },
    {
      chave: 'nomeCliente' as keyof AluguelResponse,
      titulo: 'Nome do Cliente',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) => aluguel.nomeCliente,
    },
    {
      chave: 'dataRetirada' as keyof AluguelResponse,
      titulo: 'Data Retirada',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) =>
        new Date(aluguel.dataRetirada).toLocaleDateString('pt-BR'),
    },
    {
      chave: 'dataDevolucao' as keyof AluguelResponse,
      titulo: 'Data de Devolução',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) =>
        new Date(aluguel.dataDevolucao).toLocaleDateString('pt-BR'),
    },
    {
      chave: 'valorTotal' as keyof AluguelResponse,
      titulo: 'Valor Total',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) => `R$ ${aluguel.valorTotal.toFixed(2)}`,
    },
    {
      chave: 'status' as keyof AluguelResponse,
      titulo: 'Status',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) => {
        const classeMap: Record<StatusAluguel, string> = {
          [StatusAluguel.ATIVO]: styles['status-ativo'],
          [StatusAluguel.ATRASO]: styles['status-atraso'],
          [StatusAluguel.CONCLUIDO]: styles['status-concluido'],
          [StatusAluguel.CANCELADO]: styles['status-cancelado'],
        };
        return (
          <span className={classeMap[aluguel.status] ?? styles['status-ativo']}>
            {aluguel.status}
          </span>
        );
      },
    },
    {
      chave: 'acoes' as keyof AluguelResponse,
      titulo: 'Ações',
      align: 'center' as const,
      render: (aluguel: AluguelResponse) => (
        <div className={styles['aluguel-acoes']}>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              size="sm"
              id={`acoes-${aluguel.id}`}
              className={styles['acao-toggle']}
              aria-label="Ações"
            >
              <MoreVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount popperConfig={{ strategy: 'fixed' }}>
              <Dropdown.Item onClick={() => verDetalhes(aluguel)}>
                <Eye size={14} className={styles['icone-detalhes']} />
                <span className={styles['acao-texto']}>Ver detalhes</span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate(`/alugueis/${aluguel.id}/editar`)}>
                <Edit2 size={14} className={styles['icone-editar']} />
                <span className={styles['acao-texto']}>Editar aluguel</span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => gerarContrato(aluguel)}>
                <FileText size={14} className={styles['icone-detalhes']} />
                <span className={styles['acao-texto']}>Gerar contrato</span>
              </Dropdown.Item>
              {statusPermiteDevolucao(aluguel.status) && (
                <Dropdown.Item onClick={() => abrirModalDevolucao(aluguel)}>
                  <RotateCcw size={14} className={styles['icone-devolver']} />
                  <span className={styles['acao-texto']}>Registrar devolução</span>
                </Dropdown.Item>
              )}
              <Dropdown.Item onClick={() => abrirModalExclusao(aluguel)}>
                <Trash2 size={14} className={styles['icone-excluir']} />
                <span className={styles['acao-texto']}>Excluir aluguel</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className={styles['listar-aluguel']}>
      {alertaSucesso && (
        <Alert
          variant="success"
          onClose={() => setAlertaSucesso(null)}
          dismissible
          className={styles['alerta-fixo']}
        >
          <Alert.Heading>Sucesso</Alert.Heading>
          <p>{alertaSucesso}</p>
        </Alert>
      )}

      {alertaErro && (
        <Alert
          variant="danger"
          onClose={() => setAlertaErro(null)}
          dismissible
          className={styles['alerta-fixo']}
        >
          <Alert.Heading>Erro</Alert.Heading>
          <p>{alertaErro}</p>
        </Alert>
      )}

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
          <Botao tipo="secundario" onClick={() => setPainelFiltrosAberto((prev) => !prev)}>
            <Filter size={16} />
            Filtros
          </Botao>
          <Link to="/alugueis/novo">
            <Botao>Novo Aluguel</Botao>
          </Link>
        </div>
      </header>

      <Card titulo="Lista de Aluguéis">
        <div className={styles['listar-aluguel__conteudo']}>
          {/* Task 13.1: Conditional filter panel */}
          {painelFiltrosAberto && (
            <div className={styles['painel-filtros']}>
              <div className={styles['painel-filtros__controles']}>
                <div className={styles['filtro-campo']}>
                  <label htmlFor="filtro-status">Status</label>
                  <select
                    id="filtro-status"
                    className={styles['filtro-select']}
                    value={filtros.status ?? ''}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        status: e.target.value ? (e.target.value as StatusAluguel) : undefined,
                      }))
                    }
                  >
                    <option value="">Todos</option>
                    <option value={StatusAluguel.ATIVO}>Ativo</option>
                    <option value={StatusAluguel.ATRASO}>Em Atraso</option>
                    <option value={StatusAluguel.CONCLUIDO}>Concluído</option>
                    <option value={StatusAluguel.CANCELADO}>Cancelado</option>
                  </select>
                </div>

                <div className={styles['filtro-campo']}>
                  <label htmlFor="filtro-nomeCliente">Nome do Cliente</label>
                  <input
                    id="filtro-nomeCliente"
                    type="text"
                    className={styles['filtro-input']}
                    value={filtros.nomeCliente ?? ''}
                    placeholder="Ex: João Silva"
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        nomeCliente: e.target.value || undefined,
                      }))
                    }
                  />
                </div>

                <div className={styles['filtro-campo']}>
                  <Calendario
                    id="filtro-dataRetiradaInicio"
                    label="Retirada — início"
                    value={filtros.dataRetiradaInicio ?? ''}
                    onChange={(valor) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataRetiradaInicio: valor || undefined,
                      }))
                    }
                    permitirPassado
                  />
                </div>

                <div className={styles['filtro-campo']}>
                  <Calendario
                    id="filtro-dataRetiradaFim"
                    label="Retirada — fim"
                    value={filtros.dataRetiradaFim ?? ''}
                    onChange={(valor) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataRetiradaFim: valor || undefined,
                      }))
                    }
                    permitirPassado
                  />
                </div>

                <div className={styles['filtro-campo']}>
                  <label htmlFor="filtro-ocasiao">Ocasião</label>
                  <select
                    id="filtro-ocasiao"
                    className={styles['filtro-select']}
                    value={filtros.ocasiao ?? ''}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        ocasiao: e.target.value ? (e.target.value as TipoOcasiao) : undefined,
                      }))
                    }
                  >
                    <option value="">Todas</option>
                    {Object.values(TipoOcasiao).map((ocasiao) => (
                      <option key={ocasiao} value={ocasiao}>
                        {obterAliasTipoOcasiao(ocasiao)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles['painel-filtros__acoes']}>
                <Botao tipo="primario" onClick={() => buscarComFiltros(filtros)}>
                  Buscar
                </Botao>
                <Botao
                  tipo="secundario"
                  onClick={() => {
                    const filtrosLimpos: FiltrosAluguel = { status: StatusAluguel.ATIVO };
                    setFiltros(filtrosLimpos);
                    buscarComFiltros(filtrosLimpos);
                  }}
                >
                  Limpar Filtros
                </Botao>
              </div>
            </div>
          )}

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
                onPageChange={(pagina) => carregarAluguel(filtros, pagina)}
              />
            </>
          )}
        </div>
      </Card>

      <Modal
        titulo="Confirmar Exclusão"
        mensagem={`Tem certeza que deseja excluir o aluguel ID ${aluguelParaExcluir?.id}?`}
        estaAberto={modalAberto}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => {
          setModalAberto(false);
          setAluguelParaExcluir(null);
        }}
        textoBotaoConfirmar="Excluir"
        textoBotaoCancelar="Cancelar"
        tipoBotaoConfirmar="perigo"
      />

      {modalDetalhesAberto && aluguelDetalhes && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-detalhes-container']}>
            {/* Cabeçalho */}
            <div className={styles['modal-detalhes-header']}>
              <div className={styles['modal-detalhes-header__info']}>
                <span className={styles['modal-detalhes-header__id']}>
                  Aluguel #{aluguelDetalhes.id}
                </span>
                <h2 className={styles['modal-detalhes-header__nome']}>
                  {aluguelDetalhes.nomeCliente}
                </h2>
              </div>
              <div className={styles['modal-detalhes-header__acoes']}>
                {(() => {
                  const classeMap: Record<StatusAluguel, string> = {
                    [StatusAluguel.ATIVO]: styles['status-ativo'],
                    [StatusAluguel.CONCLUIDO]: styles['status-concluido'],
                    [StatusAluguel.CANCELADO]: styles['status-cancelado'],
                  };
                  return (
                    <span className={classeMap[aluguelDetalhes.status] ?? styles['status-ativo']}>
                      {aluguelDetalhes.status}
                    </span>
                  );
                })()}
                <button
                  type="button"
                  className={styles['modal-detalhes-header__fechar']}
                  onClick={() => setModalDetalhesAberto(false)}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className={styles['modal-detalhes-corpo']}>
              {/* Coluna esquerda */}
              <div className={styles['modal-detalhes-col']}>
                <section className={styles['modal-detalhes-secao']}>
                  <h3 className={styles['modal-detalhes-secao__titulo']}>Informações</h3>
                  <div className={styles['modal-detalhes-grid']}>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>Cliente ID</span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {aluguelDetalhes.clienteId}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>Ocasião</span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {obterAliasTipoOcasiao(aluguelDetalhes.ocasiao)}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>Data de Retirada</span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {new Date(aluguelDetalhes.dataRetirada).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>
                        Data de Devolução
                      </span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {new Date(aluguelDetalhes.dataDevolucao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>Data do Aluguel</span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {new Date(aluguelDetalhes.dataAluguel).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {aluguelDetalhes.observacoes && (
                      <div
                        className={`${styles['modal-detalhe-item']} ${styles['modal-detalhe-item--full']}`}
                      >
                        <span className={styles['modal-detalhe-item__rotulo']}>Observações</span>
                        <span className={styles['modal-detalhe-item__valor']}>
                          {aluguelDetalhes.observacoes}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {aluguelDetalhes.itens?.length > 0 && (
                  <section className={styles['modal-detalhes-secao']}>
                    <h3 className={styles['modal-detalhes-secao__titulo']}>
                      Trajes
                      <span className={styles['modal-detalhes-secao__badge']}>
                        {aluguelDetalhes.itens.length}
                      </span>
                    </h3>
                    <ul className={styles['modal-trajes-lista']}>
                      {aluguelDetalhes.itens.map((item, index) => (
                        <li key={`${item.trajeId}-${index}`} className={styles['modal-traje-item']}>
                          <div className={styles['modal-traje-item__cabecalho']}>
                            <span className={styles['modal-traje-item__id']}>#{item.trajeId}</span>
                            <span className={styles['modal-traje-item__nome']}>
                              {item.nomeTraje}
                            </span>
                            {item.valorItem != null && (
                              <span className={styles['modal-traje-item__valor']}>
                                R$ {item.valorItem.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className={styles['modal-traje-item__tags']}>
                            {item.tipo && (
                              <span className={styles['modal-traje-tag']}>{item.tipo}</span>
                            )}
                            {item.tamanho && (
                              <span className={styles['modal-traje-tag']}>{item.tamanho}</span>
                            )}
                            {item.cor && (
                              <span className={styles['modal-traje-tag']}>{item.cor}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Coluna direita — resumo financeiro */}
              <div className={styles['modal-detalhes-col--resumo']}>
                <ResumoFinanceiroAluguel
                  variante="modal"
                  resumo={calcularResumoFinanceiroDeAluguel(aluguelDetalhes)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task 13.3: FormularioDevolucao modal */}
      {modalDevolucaoAberto && aluguelParaDevolver && (
        <FormularioDevolucao
          aluguelId={aluguelParaDevolver.id}
          itens={aluguelParaDevolver.itens ?? []}
          valorTotalAtual={aluguelParaDevolver.valorTotal}
          valorDesconto={aluguelParaDevolver.valorDesconto ?? 0}
          onSucesso={handleDevolucaoSucesso}
          onCancelar={handleDevolucaoCancelar}
        />
      )}
    </div>
  );
}
