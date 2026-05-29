import { Card, Modal, Paginacao, Tabela } from '@/interfaces-graficas/componentes';
import { useClientes } from '@/interfaces-graficas/contextos/ContextoClientes';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import acoesStyles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientes/ListarClientes.module.css';
import styles from '@/interfaces-graficas/paginas/clientes/listar/ListarClientesExcluidos/ListarClientesExcluidos.module.css';
import { mascararCelular, mascararCpfCnpj } from '@/interfaces-graficas/utils/formatacoes';
import { ListarClientesExcluidosUseCase, RecuperarClienteUseCase } from '@application/clientes';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import { ClienteResponse } from '@domain/entidades';
import { ClienteApiRepository } from '@infrastructure/api';
import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesExcluidosUseCase = new ListarClientesExcluidosUseCase(clienteRepositorio);
const recuperarClienteUseCase = new RecuperarClienteUseCase(clienteRepositorio);

export function ListarClientesExcluidos() {
  const { dispatch } = useClientes();
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaRecuperar, setClienteParaRecuperar] = useState<ClienteResponse | null>(null);
  const [estaRecuperando, setEstaRecuperando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    if (erro) {
      const timer = setTimeout(() => setErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [erro]);

  const carregarExcluidos = useCallback(async (pagina?: number) => {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await listarClientesExcluidosUseCase.executar(
        pagina ?? 0,
        TAMANHO_PAGINA_PADRAO,
      );

      setClientes(resultado.content);
      setTotalPaginas(Math.max(resultado.totalPages, 1));
      setTotalRegistros(resultado.totalElements);
      setPaginaAtual(resultado.number);
    } catch (error_) {
      console.error('Erro ao carregar clientes excluídos:', error_);
      setErro('Erro ao carregar clientes excluídos');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarExcluidos();
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
      setClientes((prev) => prev.filter((c) => c.id !== clienteRecuperado.id));
      setTotalRegistros((prev) => Math.max(prev - 1, 0));
      fecharModal();
      dispatch({ tipo: 'ADICIONAR_CLIENTE', payload: clienteRecuperado });
    } catch {
      fecharModal();
      setErro('Não foi possível recuperar o cliente. Tente novamente mais tarde.');
    } finally {
      setEstaRecuperando(false);
    }
  }

  function handlePageChange(pagina: number) {
    void carregarExcluidos(pagina);
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
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Clientes Excluídos</h1>
          <p>Recupere clientes removidos do sistema</p>
        </div>
      </header>

      <Card preencheAltura>
        <div className={paginaListagemStyles['pagina-listagem__area-card']}>
          {erro && (
            <Alert
              variant="danger"
              onClose={() => setErro(null)}
              dismissible
              className={acoesStyles['alerta-fixo']}
            >
              <Alert.Heading>Erro</Alert.Heading>
              <p>{erro}</p>
            </Alert>
          )}

          <div className={paginaListagemStyles['pagina-listagem__tabela']}>
            <Tabela
              colunas={colunas}
              dados={clientes}
              estaCarregando={carregando}
              linhasPorPagina={TAMANHO_PAGINA_PADRAO}
            />
          </div>

          <div className={paginaListagemStyles['pagina-listagem__paginacao']}>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              tamanhoPagina={TAMANHO_PAGINA_PADRAO}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>

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
