import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import styles from '@/interfaces-graficas/paginas/trajes/listar/ListarTrajes/ListarTrajes.module.css';
import {TRAJE_CONSTANTS} from '@application/trajes/TrajeDependencies';
import {trajeEstaAlugado} from '@domain/utils/statusTraje';
import {AluguelResponse, TrajeResponse} from '@domain/entidades';
import {AluguelApiRepository} from '@infrastructure/api';
import {
  BadgeStatusValor,
  Botao,
  Card,
  MenuFiltrosLateral,
  Modal,
  Paginacao,
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
  PainelFiltroInput,
  Tabela,
} from '@interfaces-graficas/componentes';
import type {Coluna} from '@interfaces-graficas/componentes/data/Tabela';
import {ModalVisualizacaoImagem} from '@interfaces-graficas/componentes/feedback/ModalVisualizacaoImagem';
import {useTrajes} from '@interfaces-graficas/contextos/ContextoTrajes';
import {FormularioDevolucao} from '@interfaces-graficas/paginas/alugueis/devolver/FormularioDevolucao';
import {Edit2, Filter, ImageIcon, MoreVertical, Trash2} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Dropdown} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export function ListarTrajes() {
  const { estado, carregarTrajes, removerTraje, atualizarImagem, removerImagem } = useTrajes();
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState({ termo: '' });
  const [termoAplicado, setTermoAplicado] = useState('');
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [trajeParaExcluir, setTrajeParaExcluir] = useState<TrajeResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);
  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [trajeSelecionado, setTrajeSelecionado] = useState<TrajeResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inicializou, setInicializou] = useState(false);
  const [alertaErro, setAlertaErro] = useState<string | null>(null);
  
  useEffect(() => {
    if (alertaErro) {
      const timer = setTimeout(() => setAlertaErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaErro]);

  // Devolução
  const aluguelRepositorio = useMemo(() => new AluguelApiRepository(), []);
  const [modalDevolucaoAberto, setModalDevolucaoAberto] = useState(false);
  const [aluguelParaDevolver, setAluguelParaDevolver] = useState<AluguelResponse | null>(null);
  const [, setEstaBuscandoAluguel] = useState(false);

  const carregarDados = useCallback(
    (busca?: string, pagina?: number) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      carregarTrajes(busca, pagina);
    },
    [carregarTrajes]
  );

  function buscarComFiltros() {
    setTermoAplicado(filtros.termo);
    setPainelFiltrosAberto(false);
    carregarDados(filtros.termo || undefined, 0);
  }

  function limparFiltros() {
    setFiltros({ termo: '' });
    setTermoAplicado('');
    setPainelFiltrosAberto(false);
    carregarDados(undefined, 0);
  }

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!inicializou) {
      setInicializou(true);
      carregarTrajes();
    }
  }, [carregarTrajes, inicializou]);

  const abrirModalExclusao = useCallback((traje: TrajeResponse) => {
    setTrajeParaExcluir(traje);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setTrajeParaExcluir(null);
  }, []);

  const confirmarExclusao = useCallback(async () => {
    if (!trajeParaExcluir) return;

    setEstaExcluindo(true);
    try {
      await removerTraje(trajeParaExcluir.id);
      fecharModalExclusao();
      carregarDados(termoAplicado || undefined, estado.paginaAtual);
    } catch {
      fecharModalExclusao();
      if (trajeEstaAlugado(trajeParaExcluir.status)) {
        setAlertaErro('Não é possível excluir o traje pois ele está alugado no momento. Realize a devolução antes de excluí-lo.');
      } else {
        setAlertaErro('Não foi possível excluir o traje. Tente novamente mais tarde.');
      }
    } finally {
      setEstaExcluindo(false);
    }
  }, [trajeParaExcluir, removerTraje, fecharModalExclusao, carregarDados, termoAplicado, estado.paginaAtual]);

  const handlePageChange = useCallback(
    (pagina: number) => {
      carregarDados(termoAplicado || undefined, pagina);
    },
    [carregarDados, termoAplicado]
  );

  const abrirModalImagem = useCallback((traje: TrajeResponse) => {
    setTrajeSelecionado(traje);
    setModalImagemAberto(true);
  }, []);

  const fecharModalImagem = useCallback(() => {
    setModalImagemAberto(false);
    setTrajeSelecionado(null);
  }, []);

  const abrirDevolucao = useCallback(async (traje: TrajeResponse) => {
    setEstaBuscandoAluguel(true);
    try {
      const aluguel = await aluguelRepositorio.buscarAtivoByTrajeId(traje.id);
      setAluguelParaDevolver(aluguel);
      setModalDevolucaoAberto(true);
    } catch {
      setAlertaErro(`Nenhum aluguel ativo encontrado para o traje "${traje.nome}"`);
    } finally {
      setEstaBuscandoAluguel(false);
    }
  }, [aluguelRepositorio]);

  const handleAtualizarImagem = useCallback(
    async (trajeId: number, file: File) => {
      try {
        const novaUrl = await atualizarImagem(trajeId, file);
        setTrajeSelecionado((prev) => (prev ? { ...prev, imagem: novaUrl, imagemUrl: novaUrl } : null));
      } catch {
        setAlertaErro('Erro ao atualizar imagem');
      }
    },
      [atualizarImagem],
  );

  const handleRemoverImagem = useCallback(
    async (trajeId: number) => {
      try {
        await removerImagem(trajeId);
        setTrajeSelecionado((prev) => (prev ? { ...prev, imagem: '', imagemUrl: '' } : null));
      } catch {
        setAlertaErro('Erro ao remover imagem');
      }
    },
      [removerImagem],
  );

  const colunas = useMemo<Coluna<TrajeResponse>[]>(
    () => [
      {
        chave: 'imagem' as const,
        titulo: 'Imagem',
        render: (traje) => (
          <button
            type="button"
            className={styles['listar-trajes__botao-imagem']}
            onClick={() => abrirModalImagem(traje)}
            title="Ver imagem"
          >
            {traje.imagem ? (
              <img src={traje.imagem} alt="" className={styles['listar-trajes__miniatura']} />
            ) : (
              <ImageIcon size={20} className={styles['listar-trajes__sem-imagem']} />
            )}
          </button>
        ),
      },
      { chave: 'id', titulo: 'ID' },
      { chave: 'nome', titulo: 'Nome' },
      { chave: 'tamanho', titulo: 'Tamanho' },
      { chave: 'cor', titulo: 'Cor' },
      {
        chave: 'preco',
        titulo: 'Preço',
        render: (traje) =>
          traje.preco?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '-',
      },
      {
        chave: 'status',
        titulo: 'Status',
        render: (traje) => <BadgeStatusValor status={traje.status} />,
      },
      {
		  chave: 'acoes',
		  titulo: 'Ações',
		  width: '80px',
		  render: (traje: TrajeResponse) => (
			  <div className={styles['listar-trajes__acoes']}>
				  <Dropdown align="end">
					  <Dropdown.Toggle
						  variant="light"
					      size="sm"
					      id={`acoes-${traje.id}`}
					      className={styles['acao-toggle']}
					      aria-label="Ações"
            >
						  <MoreVertical size={16}/>
					  </Dropdown.Toggle>
					  <Dropdown.Menu
						  renderOnMount
					      popperConfig={{strategy: 'fixed'}}
					  >
						  <Dropdown.Item as={Link} to={TRAJE_CONSTANTS.ROUTES.EDITAR(traje.id)}>
							  <Edit2 size={14} className={styles['icone-editar']}/>
							  <span className={styles['acao-texto']}>Editar traje</span>
						  </Dropdown.Item>
						  {trajeEstaAlugado(traje.status) && (
							  <Dropdown.Item onClick={() => abrirDevolucao(traje)}>
								  <span className={styles['acao-texto']}>Registrar devolução</span>
							  </Dropdown.Item>
						  )}
						  <Dropdown.Item onClick={() => abrirModalExclusao(traje)}>
							  <Trash2 size={14} className={styles['icone-excluir']}/>
							  <span className={styles['acao-texto']}>Excluir traje</span>
						  </Dropdown.Item>
					  </Dropdown.Menu>
				  </Dropdown>
			  </div>
		  ),
      },
    ],
    [abrirModalImagem, abrirModalExclusao, abrirDevolucao]
  );

  return (
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Trajes</h1>
          <p>Gerencie os trajes do sistema</p>
        </div>
        <div className={paginaListagemStyles['pagina-listagem__acoes']}>
          <Botao tipo="secundario" onClick={() => setPainelFiltrosAberto(true)}>
            <Filter size={16} />
            Filtros
          </Botao>
          <Link to={TRAJE_CONSTANTS.ROUTES.CRIAR}>
            <Botao>Novo Traje</Botao>
          </Link>
        </div>
      </header>

      <MenuFiltrosLateral
        aberto={painelFiltrosAberto}
        onFechar={() => setPainelFiltrosAberto(false)}
      >
        <PainelFiltro variante="lateral">
          <PainelFiltroControles>
            <PainelFiltroCampo id="filtro-traje-termo" label="Busca">
              <PainelFiltroInput
                id="filtro-traje-termo"
                type="text"
                value={filtros.termo}
                placeholder="Nome, tamanho ou cor..."
                onChange={(e) => setFiltros({ termo: e.target.value })}
              />
            </PainelFiltroCampo>
          </PainelFiltroControles>
          <PainelFiltroAcoes
            onBuscar={buscarComFiltros}
            onLimpar={limparFiltros}
            carregando={estado.estaCarregando}
          />
        </PainelFiltro>
      </MenuFiltrosLateral>

      <Card preencheAltura>
        <div className={paginaListagemStyles['pagina-listagem__area-card']}>
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

        <div className={paginaListagemStyles['pagina-listagem__tabela']}>
          <Tabela
            colunas={colunas}
            dados={estado.trajes}
            estaCarregando={estado.estaCarregando}
            linhasPorPagina={estado.tamanhoPagina}
          />
        </div>

        <div className={paginaListagemStyles['pagina-listagem__paginacao']}>
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
        estaAberto={modalExclusaoAberto}
        aoConfirmar={confirmarExclusao}
        aoCancelar={fecharModalExclusao}
        textoBotaoConfirmar={estaExcluindo ? 'Excluindo...' : 'Excluir'}
        textoBotaoCancelar="Cancelar"
        tipoBotaoConfirmar="perigo"
      />

      <ModalVisualizacaoImagem
        imagemUrl={trajeSelecionado?.imagem}
        trajeId={trajeSelecionado?.id ?? 0}
        trajeNome={trajeSelecionado?.nome ?? ''}
        estaAberto={modalImagemAberto}
        aoFechar={fecharModalImagem}
        aoAtualizarImagem={handleAtualizarImagem}
        aoRemoverImagem={handleRemoverImagem}
      />

      {modalDevolucaoAberto && aluguelParaDevolver !== null && (
        <FormularioDevolucao
          aluguelId={aluguelParaDevolver.id}
          itens={aluguelParaDevolver.itens ?? []}
          valorTotalAtual={aluguelParaDevolver.valorTotal}
          valorDesconto={aluguelParaDevolver.valorDesconto ?? 0}
          onSucesso={() => {
            setModalDevolucaoAberto(false);
            setAluguelParaDevolver(null);
            carregarDados(termoAplicado || undefined, estado.paginaAtual);
          }}
          onCancelar={() => {
            setModalDevolucaoAberto(false);
            setAluguelParaDevolver(null);
          }}
        />
      )}
    </div>
  );
}
