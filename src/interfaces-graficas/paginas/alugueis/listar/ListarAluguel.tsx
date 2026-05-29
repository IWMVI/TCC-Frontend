import {
  BadgeStatusValor,
  Botao,
  Calendario,
  Card,
  Modal,
  Paginacao,
  MenuFiltrosLateral,
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
  PainelFiltroInput,
  PainelFiltroSelect,
  Tabela,
} from '@/interfaces-graficas/componentes';
import { FormularioDevolucao } from '@/interfaces-graficas/paginas/alugueis/devolver/FormularioDevolucao';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import { formatarDataBr } from '@/interfaces-graficas/utils/formatarData';
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
  Edit2,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const aluguelRepositorio = new AluguelApiRepository();
const listarAlugueisUseCase = new ListarAlugueisUseCase(aluguelRepositorio);
const deletarAluguelUseCase = new DeletarAluguelUseCase(aluguelRepositorio);
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);
const gerarContratoUseCase = new GerarContratoAluguelUseCase(aluguelRepositorio);

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
        setTotalPaginas(Math.max(resultado.totalPages, 1));
        setTotalRegistros(resultado.totalElements);
        setTamanhoPagina(TAMANHO_PAGINA_PADRAO);
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
    { chave: 'id' as keyof AluguelResponse, titulo: 'ID' },
    {
      chave: 'nomeCliente' as keyof AluguelResponse,
      titulo: 'Nome do Cliente',
      render: (aluguel: AluguelResponse) => aluguel.nomeCliente,
    },
    {
      chave: 'dataRetirada' as keyof AluguelResponse,
      titulo: 'Data Retirada',
      render: (aluguel: AluguelResponse) => formatarDataBr(aluguel.dataRetirada),
    },
    {
      chave: 'dataDevolucao' as keyof AluguelResponse,
      titulo: 'Data de Devolução',
      render: (aluguel: AluguelResponse) => formatarDataBr(aluguel.dataDevolucao),
    },
    {
      chave: 'valorTotal' as keyof AluguelResponse,
      titulo: 'Valor Total',
      render: (aluguel: AluguelResponse) => `R$ ${aluguel.valorTotal.toFixed(2)}`,
    },
    {
      chave: 'status' as keyof AluguelResponse,
      titulo: 'Status',
      render: (aluguel: AluguelResponse) => <BadgeStatusValor status={aluguel.status} />,
    },
    {
      chave: 'acoes' as keyof AluguelResponse,
      titulo: 'Ações',
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
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
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

      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Aluguéis</h1>
          <p>Gerencie os aluguéis do sistema</p>
        </div>
        <div className={paginaListagemStyles['pagina-listagem__acoes']}>
          <Botao tipo="secundario" onClick={() => setPainelFiltrosAberto(true)}>
            <Filter size={16} />
            Filtros
          </Botao>
          <Link to="/alugueis/novo">
            <Botao>Novo Aluguel</Botao>
          </Link>
        </div>
      </header>

      <MenuFiltrosLateral
        aberto={painelFiltrosAberto}
        onFechar={() => setPainelFiltrosAberto(false)}
      >
        <PainelFiltro variante="lateral">
              <PainelFiltroControles>
                <PainelFiltroCampo id="filtro-status" label="Status">
                  <PainelFiltroSelect
                    id="filtro-status"
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
                  </PainelFiltroSelect>
                </PainelFiltroCampo>

                <PainelFiltroCampo id="filtro-nomeCliente" label="Nome do Cliente">
                  <PainelFiltroInput
                    id="filtro-nomeCliente"
                    type="text"
                    value={filtros.nomeCliente ?? ''}
                    placeholder="Ex: João Silva"
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        nomeCliente: e.target.value || undefined,
                      }))
                    }
                  />
                </PainelFiltroCampo>

                <PainelFiltroCampo>
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
                </PainelFiltroCampo>

                <PainelFiltroCampo>
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
                </PainelFiltroCampo>

                <PainelFiltroCampo id="filtro-ocasiao" label="Ocasião">
                  <PainelFiltroSelect
                    id="filtro-ocasiao"
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
                  </PainelFiltroSelect>
                </PainelFiltroCampo>
              </PainelFiltroControles>

              <PainelFiltroAcoes
                onBuscar={() => buscarComFiltros(filtros)}
                onLimpar={() => {
                  const filtrosLimpos: FiltrosAluguel = { status: StatusAluguel.ATIVO };
                  setFiltros(filtrosLimpos);
                  buscarComFiltros(filtrosLimpos);
                }}
                carregando={estaCarregando}
              />
        </PainelFiltro>
      </MenuFiltrosLateral>

      <Card preencheAltura>
        <div className={paginaListagemStyles['pagina-listagem__area-card']}>
          <div className={paginaListagemStyles['pagina-listagem__tabela']}>
            <Tabela
              colunas={colunas}
              dados={alugueis}
              estaCarregando={estaCarregando}
              linhasPorPagina={tamanhoPagina}
            />
          </div>

          <div className={paginaListagemStyles['pagina-listagem__paginacao']}>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              tamanhoPagina={tamanhoPagina}
              onPageChange={(pagina) => carregarAluguel(filtros, pagina)}
            />
          </div>
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
                <BadgeStatusValor status={aluguelDetalhes.status} />
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
                        {formatarDataBr(aluguelDetalhes.dataRetirada)}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>
                        Data de Devolução
                      </span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {formatarDataBr(aluguelDetalhes.dataDevolucao)}
                      </span>
                    </div>
                    <div className={styles['modal-detalhe-item']}>
                      <span className={styles['modal-detalhe-item__rotulo']}>Data do Aluguel</span>
                      <span className={styles['modal-detalhe-item__valor']}>
                        {formatarDataBr(aluguelDetalhes.dataAluguel)}
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
