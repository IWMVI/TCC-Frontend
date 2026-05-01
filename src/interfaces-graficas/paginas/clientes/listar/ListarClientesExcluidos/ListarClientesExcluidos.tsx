import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Card, Tabela, Modal, Paginacao } from '@/interfaces-graficas/componentes';
import { useClientes } from '@/interfaces-graficas/contextos/ContextoClientes';
import {
  ListarClientesExcluidosUseCase,
  RecuperarClienteUseCase,
} from '@application/clientes';
import { ClienteApiRepository } from '@infrastructure/api';
import { ClienteResponse } from '@domain/entidades';
import { mascararCpfCnpj, mascararCelular } from '@/interfaces-graficas/utils/formatacoes';
import styles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientesExcluidos/ListarClientesExcluidos.module.css';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesExcluidosUseCase = new ListarClientesExcluidosUseCase(clienteRepositorio);
const recuperarClienteUseCase = new RecuperarClienteUseCase(clienteRepositorio);

const TAMANHO_PAGINA_PADRAO = 10;

export function ListarClientesExcluidos() {
  const navigate = useNavigate();
  const { dispatch } = useClientes();
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaRecuperar, setClienteParaRecuperar] = useState<ClienteResponse | null>(null);
  const [estaRecuperando, setEstaRecuperando] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const tamanhoPagina = TAMANHO_PAGINA_PADRAO;

  const jaCarregouRef = useRef(false);

  const carregarExcluidos = useCallback(async (pagina?: number) => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await listarClientesExcluidosUseCase.executar(pagina ?? 0, tamanhoPagina);

      setClientes(resultado.content);
      setTotalPaginas(resultado.totalPages);
      setTotalRegistros(resultado.totalElements);
      setPaginaAtual(resultado.number);
    } catch (error_) {
      console.error('Erro ao carregar clientes excluídos:', error_);
      setErro('Erro ao carregar clientes excluídos');
    } finally {
      setCarregando(false);
    }
  }, [tamanhoPagina]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!jaCarregouRef.current) {
      jaCarregouRef.current = true;
      carregarExcluidos();
    }
  }, [carregarExcluidos]);

  function abrirModalRecuperacao(cliente: ClienteResponse) {
    setClienteParaRecuperar(cliente);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setClienteParaRecuperar(null);
  }

  async function confirmarRecuperacao() {
    if (!clienteParaRecuperar) return;

    setEstaRecuperando(true);
    try {
      const clienteRecuperado = await recuperarClienteUseCase.executar(clienteParaRecuperar.id);
      // Remove da lista local
      setClientes((prev) => prev.filter((c) => c.id !== clienteRecuperado.id));
      fecharModal();

      // Notifica via contexto
      dispatch({ tipo: 'ADICIONAR_CLIENTE', payload: clienteRecuperado });
    } catch {
      setErro('Erro ao recuperar cliente');
    } finally {
      setEstaRecuperando(false);
    }
  }

  function handlePageChange(pagina: number) {
    carregarExcluidos(pagina);
  }

  function handleVoltar() {
    navigate('/clientes');
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
      width: '150px',
      render: (cliente: ClienteResponse) => (
        <div className={styles['listar-excluidos__acoes']}>
          <button
            type="button"
            className={styles['listar-excluidos__botao-recuperar']}
            onClick={() => abrirModalRecuperacao(cliente)}
            title="Recuperar cliente"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles['listar-excluidos']}>
      <header className={styles['listar-excluidos__header']}>
        <div className={styles['listar-excluidos__navegacao']}>
          <button
            type="button"
            className={styles['listar-excluidos__botao-voltar']}
            onClick={handleVoltar}
            title="Voltar para página de clientes"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className={styles['listar-excluidos__titulo']}>
            <h1>Clientes Excluídos</h1>
            <p>Recupere clientes removidos do sistema</p>
          </div>
        </div>
      </header>

      <Card titulo="Lista de Clientes Excluídos">
        <div className={styles.card__conteudo}>
          {erro && <div className={styles.card__erro}>{erro}</div>}

          {clientes.length === 0 && !carregando ? (
            <div className={styles.card__vazio}>Nenhum cliente excluído encontrado</div>
          ) : (
            <>
              <div className={styles.card__corpo}>
                <Tabela colunas={colunas} dados={clientes} />
              </div>

              {totalPaginas > 1 && (
                <Paginacao
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  totalRegistros={totalRegistros}
                  tamanhoPagina={tamanhoPagina}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </Card>

      {/* Modal de Confirmação */}
      {clienteParaRecuperar && (
        <Modal
          estaAberto={modalAberto}
          titulo="Recuperar Cliente"
          mensagem={`Deseja recuperar o cliente ${clienteParaRecuperar.nome}?\nEle voltará a aparecer na lista de clientes ativos.`}
          aoCancelar={fecharModal}
          aoConfirmar={confirmarRecuperacao}
          textoBotaoConfirmar={estaRecuperando ? 'Recuperando...' : 'Recuperar'}
          textoBotaoCancelar="Cancelar"
          tipoBotaoConfirmar="primario"
        />
      )}
    </div>
  );
}
