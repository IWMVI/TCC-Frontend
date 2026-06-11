import {
  Botao,
  Card,
  Modal,
  Paginacao,
  MenuFiltrosLateral,
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
  PainelFiltroInput,
  Tabela,
} from '@/interfaces-graficas/componentes';
import {useClientes} from '@/interfaces-graficas/contextos/ContextoClientes';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import styles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes.module.css';
import {mascararCelular, mascararCpfCnpj} from '@/interfaces-graficas/utils/formatacoes';
import {DeletarClienteUseCase, ListarClientesUseCase} from '@application/clientes';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import {ClienteResponse} from '@domain/entidades';
import {ClienteApiRepository} from '@infrastructure/api';
import {Edit2, Filter, MoreVertical, Trash2} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Dropdown} from 'react-bootstrap';
import {Link} from 'react-router-dom';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesUseCase = new ListarClientesUseCase(clienteRepositorio);
const deletarClienteUseCase = new DeletarClienteUseCase(clienteRepositorio);

export function ListarClientes() {
  const { estado, dispatch } = useClientes();
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState({ termo: '' });
  const [termoAplicado, setTermoAplicado] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const jaCarregouRef = useRef(false);
	const [alertaErro, setAlertaErro] = useState<string | null>(null);
	
	useEffect(() => {
		if (alertaErro) {
			const timer = setTimeout(() => setAlertaErro(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [alertaErro]);

  const carregarClientes = useCallback(
    async (busca?: string, pagina?: number) => {
      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      dispatch({ tipo: 'SET_CARREGANDO', payload: true });
		setAlertaErro(null);
      try {
        const resultado = await listarClientesUseCase.executar(
          busca,
          pagina ?? 0,
          TAMANHO_PAGINA_PADRAO
        );
        
        if (!signal.aborted) {
          dispatch({ tipo: 'SET_CLIENTES', payload: resultado.content });
          dispatch({
            tipo: 'SET_PAGINACAO',
            payload: {
              totalPaginas: Math.max(resultado.totalPages, 1),
              totalRegistros: resultado.totalElements,
              tamanhoPagina: TAMANHO_PAGINA_PADRAO,
              paginaAtual: resultado.number,
            },
          });
        }
      } catch (erro) {
        if (erro instanceof Error && erro.name !== 'AbortError') {
			setAlertaErro('Erro ao carregar clientes');
        }
      } finally {
        if (!signal.aborted) {
          dispatch({ tipo: 'SET_CARREGANDO', payload: false });
        }
      }
    },
    [dispatch]
  );

  // Carregar dados iniciais
  useEffect(() => {
    if (!jaCarregouRef.current) {
      jaCarregouRef.current = true;
      carregarClientes();
    }
  }, [carregarClientes]);

  // Limpar requisições ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  function buscarComFiltros() {
    setTermoAplicado(filtros.termo);
    setPainelFiltrosAberto(false);
    carregarClientes(filtros.termo || undefined, 0);
  }

  function limparFiltros() {
    setFiltros({ termo: '' });
    setTermoAplicado('');
    setPainelFiltrosAberto(false);
    carregarClientes(undefined, 0);
  }

  function abrirModalExclusao(cliente: ClienteResponse) {
    setClienteParaExcluir(cliente);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setClienteParaExcluir(null);
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir) return;

    setEstaExcluindo(true);
    try {
      await deletarClienteUseCase.executar(clienteParaExcluir.id);
      dispatch({ tipo: 'REMOVER_CLIENTE', payload: clienteParaExcluir.id });
      fecharModal();
      // Recarrega a lista após exclusão
      carregarClientes(termoAplicado || undefined, estado.paginaAtual);
    } catch {
		fecharModal();
		setAlertaErro('Não foi possível excluir o cliente. Tente novamente mais tarde.');
    } finally {
      setEstaExcluindo(false);
    }
  }

  function handlePageChange(pagina: number) {
    carregarClientes(termoAplicado || undefined, pagina);
  }

  const colunas = [
    { chave: 'id' as keyof ClienteResponse, titulo: 'ID', width: '60px' },
    { chave: 'nome' as keyof ClienteResponse, titulo: 'Nome' },
    {
      chave: 'cpfCnpj' as keyof ClienteResponse,
      titulo: 'CPF/CNPJ',
      render: (cliente: ClienteResponse) => mascararCpfCnpj(cliente.cpfCnpj),
    },
    { chave: 'email' as keyof ClienteResponse, titulo: 'E-mail' },
    {
      chave: 'celular' as keyof ClienteResponse,
      titulo: 'Celular',
      render: (cliente: ClienteResponse) => mascararCelular(cliente.celular),
    },
    {
      chave: 'acoes' as keyof ClienteResponse,
      titulo: 'Ações',
		width: '80px',
      render: (cliente: ClienteResponse) => (
        <div className={styles['listar-clientes__acoes']}>
			<Dropdown align="end">
				<Dropdown.Toggle
					variant="light"
			        size="sm"
			        id={`acoes-${cliente.id}`}
			        className={styles['acao-toggle']}
			        aria-label="Ações"
				>
					<MoreVertical size={16}/>
				</Dropdown.Toggle>
				<Dropdown.Menu
					renderOnMount
			        popperConfig={{strategy: 'fixed'}}
				>
					<Dropdown.Item as={Link} to={`/clientes/${cliente.id}/editar`}>
						<Edit2 size={14} className={styles['icone-editar']}/>
						<span className={styles['acao-texto']}>Editar cliente</span>
					</Dropdown.Item>
					<Dropdown.Item onClick={() => abrirModalExclusao(cliente)}>
						<Trash2 size={14} className={styles['icone-excluir']}/>
						<span className={styles['acao-texto']}>Excluir cliente</span>
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Clientes</h1>
          <p>Gerencie os clientes do sistema</p>
        </div>
        <div className={paginaListagemStyles['pagina-listagem__acoes']}>
          <Botao tipo="secundario" onClick={() => setPainelFiltrosAberto(true)}>
            <Filter size={16} />
            Filtros
          </Botao>
          <Link to="/clientes/excluidos">
            <Botao tipo="secundario">Ver Excluídos</Botao>
          </Link>
          <Link to="/clientes/novo">
            <Botao>Novo Cliente</Botao>
          </Link>
        </div>
      </header>

      <MenuFiltrosLateral
        aberto={painelFiltrosAberto}
        onFechar={() => setPainelFiltrosAberto(false)}
      >
        <PainelFiltro variante="lateral">
          <PainelFiltroControles>
            <PainelFiltroCampo id="filtro-cliente-termo" label="Busca">
              <PainelFiltroInput
                id="filtro-cliente-termo"
                type="text"
                value={filtros.termo}
                placeholder="Nome, CPF ou e-mail..."
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
                dados={estado.clientes}
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
        mensagem={`Tem certeza que deseja excluir o cliente "${clienteParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
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
