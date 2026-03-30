import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Botao, Card, Tabela, Modal, Busca, Paginacao } from '../../../../componentes';
import { useClientes } from '../../../../contextos/ContextoClientes';
import { ListarClientesUseCase, DeletarClienteUseCase } from '../../../../../application/clientes';
import { ClienteApiRepository } from '../../../../../infrastructure/api';
import { ClienteResponse } from '../../../../../domain/entidades';
import { mascararCpfCnpj, mascararCelular } from '../../../../utils/formatacoes';
import styles from './ListarClientes.module.css';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesUseCase = new ListarClientesUseCase(clienteRepositorio);
const deletarClienteUseCase = new DeletarClienteUseCase(clienteRepositorio);

const TAMANHO_PAGINA_PADRAO = 10;

export function ListarClientes() {
  const { estado, dispatch } = useClientes();
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);

  const carregarClientes = useCallback(
    async (busca?: string, pagina?: number) => {
      dispatch({ tipo: 'SET_CARREGANDO', payload: true });
      dispatch({ tipo: 'SET_ERRO', payload: null });
      try {
        const resultado = await listarClientesUseCase.executar(
          busca,
          pagina ?? estado.paginaAtual,
          TAMANHO_PAGINA_PADRAO
        );
        dispatch({ tipo: 'SET_CLIENTES', payload: resultado.content });
        dispatch({
          tipo: 'SET_PAGINACAO',
          payload: {
            totalPaginas: resultado.totalPages,
            totalRegistros: resultado.totalElements,
            tamanhoPagina: resultado.size,
            paginaAtual: resultado.number,
          },
        });
      } catch (_erro) {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao carregar clientes' });
      } finally {
        dispatch({ tipo: 'SET_CARREGANDO', payload: false });
      }
    },
    [dispatch, estado.paginaAtual]
  );

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarClientes(termoBusca || undefined, 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarClientes]);

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
      carregarClientes(termoBusca || undefined, estado.paginaAtual);
    } catch (_erro) {
      dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao excluir cliente' });
    } finally {
      setEstaExcluindo(false);
    }
  }

  function handlePageChange(pagina: number) {
    carregarClientes(termoBusca || undefined, pagina);
  }

  function handleVoltar() {
    navigate(-1);
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
      width: '180px',
      render: (cliente: ClienteResponse) => (
        <div className={styles['listar-clientes__acoes']}>
          <Link
            to={`/clientes/${cliente.id}/editar`}
            className={styles['listar-clientes__botao-editar']}
            title="Editar cliente"
          >
            Editar
          </Link>
          <button
            type="button"
            className={styles['listar-clientes__botao-excluir']}
            onClick={() => abrirModalExclusao(cliente)}
            title="Excluir cliente"
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles['listar-clientes']}>
      <header className={styles['listar-clientes__header']}>
        <div className={styles['listar-clientes__navegacao']}>
          <button
            type="button"
            className={styles['listar-clientes__botao-voltar']}
            onClick={handleVoltar}
            title="Voltar para página anterior"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className={styles['listar-clientes__titulo']}>
            <h1>Clientes</h1>
            <p>Gerencie os clientes do sistema</p>
          </div>
        </div>
        <Link to="/clientes/novo">
          <Botao>Novo Cliente</Botao>
        </Link>
      </header>

      <Card titulo="Lista de Clientes">
        <div className={styles.card__conteudo}>
          <div className={styles.card__corpo}>
            <div className={styles['listar-clientes__busca']}>
              <Busca
                valor={termoBusca}
                onChange={setTermoBusca}
                placeholder="Buscar por nome, CPF ou e-mail..."
                onSearch={(valor) => carregarClientes(valor || undefined, 0)}
              />
            </div>

            {estado.erro && <div className={styles['listar-clientes__erro']}>{estado.erro}</div>}

            <div className={styles['listar-clientes__tabela-wrapper']}>
              <Tabela colunas={colunas} dados={estado.clientes} estaCarregando={estado.estaCarregando} />
            </div>
          </div>

          <div className={styles['listar-clientes__paginacao-container']}>
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
