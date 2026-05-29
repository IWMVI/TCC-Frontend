import { useState, useCallback, useRef, useEffect } from 'react';
import { ClienteResponse } from '@domain/entidades';
import {
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
  PainelFiltroInput,
} from '@/interfaces-graficas/componentes';
import { ListarClientesUseCase } from '@application/clientes';
import { ClienteApiRepository } from '@infrastructure/api';
import { CriarCliente } from '@/interfaces-graficas/paginas/clientes/criar/CriarCliente/CriarCliente';
import { Tabela } from '@/interfaces-graficas/componentes';
import { ModalFormulario } from '@/interfaces-graficas/componentes/feedback/ModalFormulario/ModalFormulario';
import { mascararCpfCnpj, mascararCelular } from '@/interfaces-graficas/utils/formatacoes';
import styles from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorCliente.module.css';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesUseCase = new ListarClientesUseCase(clienteRepositorio);

interface Props {
  clienteSelecionado: ClienteResponse | null;
  onClienteChange: (cliente: ClienteResponse | null) => void;
}

export function SelecionadorCliente({
  clienteSelecionado,
  onClienteChange,
}: Readonly<Props>) {
  const [filtros, setFiltros] = useState({ cpf: '', nome: '' });
  const [termoAplicadoCpf, setTermoAplicadoCpf] = useState('');
  const [termoAplicadoNome, setTermoAplicadoNome] = useState('');
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [buscaSemResultados, setBuscaSemResultados] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const carregarClientes = useCallback(async (busca?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setEstaCarregando(true);
    setBuscaSemResultados(false);
    const termoAtual = busca?.trim() ?? '';

    try {
      const resultado = await listarClientesUseCase.executar(busca, 0, 50);
      const lista = resultado.content || [];
      setClientes(lista);
      setBuscaSemResultados(termoAtual.length > 0 && lista.length === 0);
    } catch {
      setClientes([]);
      setBuscaSemResultados(false);
    } finally {
      setEstaCarregando(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  function buscarComFiltros() {
    if (clienteSelecionado) {
      return;
    }
    setTermoAplicadoCpf(filtros.cpf);
    setTermoAplicadoNome(filtros.nome);
    const termo = filtros.cpf || filtros.nome;
    if (termo) {
      void carregarClientes(termo);
    } else {
      setClientes([]);
      setBuscaSemResultados(false);
    }
  }

  function limparFiltros() {
    setFiltros({ cpf: '', nome: '' });
    setTermoAplicadoCpf('');
    setTermoAplicadoNome('');
    setClientes([]);
    setBuscaSemResultados(false);
  }

  function selecionarCliente(cliente: ClienteResponse) {
    onClienteChange(cliente);
    limparFiltros();
  }

  function limparClienteSelecionado() {
    onClienteChange(null);
    limparFiltros();
  }

  function handleCadastroSucesso(cliente: ClienteResponse) {
    setModalCadastroAberto(false);
    selecionarCliente(cliente);
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
      width: '100px',
      render: (cliente: ClienteResponse) => (
        <button
          type="button"
          className={styles.botaoSelecionar}
          onClick={() => selecionarCliente(cliente)}
        >
          Selecionar
        </button>
      ),
    },
  ];

  const exibeResultados =
    !clienteSelecionado && (termoAplicadoCpf.length > 0 || termoAplicadoNome.length > 0);
  let conteudoResultados: JSX.Element | null = null;

  if (estaCarregando) {
    conteudoResultados = <p className={styles.mensagem}>Carregando...</p>;
  } else if (clientes.length === 0) {
    conteudoResultados = (
      <div className={styles.semResultados}>
        <p className={styles.mensagem}>Nenhum cliente encontrado</p>
        {buscaSemResultados && (
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={() => setModalCadastroAberto(true)}
          >
            Cadastrar cliente
          </button>
        )}
      </div>
    );
  } else {
    conteudoResultados = (
      <Tabela colunas={colunas} dados={clientes} preencherLinhas={false} />
    );
  }

  return (
    <div className={styles.selecionadorCliente}>
      {!clienteSelecionado && (
        <PainelFiltro>
          <PainelFiltroControles>
            <PainelFiltroCampo id="cpf-busca" label="CPF">
              <PainelFiltroInput
                id="cpf-busca"
                type="text"
                placeholder="Pesquisar por CPF..."
                value={filtros.cpf}
                onChange={(e) => setFiltros((prev) => ({ ...prev, cpf: e.target.value }))}
              />
            </PainelFiltroCampo>
            <PainelFiltroCampo id="nome-busca" label="Nome">
              <PainelFiltroInput
                id="nome-busca"
                type="text"
                placeholder="Pesquisar por nome..."
                value={filtros.nome}
                onChange={(e) => setFiltros((prev) => ({ ...prev, nome: e.target.value }))}
              />
            </PainelFiltroCampo>
          </PainelFiltroControles>
          <PainelFiltroAcoes
            onBuscar={buscarComFiltros}
            onLimpar={limparFiltros}
            carregando={estaCarregando}
          />
        </PainelFiltro>
      )}

      {clienteSelecionado && (
        <div className={styles.clienteSelecionado}>
          <h3>Cliente Selecionado</h3>
          <div className={styles.cardCliente}>
            <p>
              <strong>Nome:</strong> {clienteSelecionado.nome}
            </p>
            <p>
              <strong>CPF:</strong> {mascararCpfCnpj(clienteSelecionado.cpfCnpj)}
            </p>
            <p>
              <strong>E-mail:</strong> {clienteSelecionado.email}
            </p>
            <button
              type="button"
              className={styles.botaoRemover}
              onClick={limparClienteSelecionado}
            >
              Remover Seleção
            </button>
          </div>
        </div>
      )}

      {exibeResultados && (
        <div className={styles.resultados}>
          <h3>Resultados da Busca</h3>
          {conteudoResultados}
        </div>
      )}

      <ModalFormulario
        titulo="Cadastrar Cliente"
        estaAberto={modalCadastroAberto}
        aoFechar={() => setModalCadastroAberto(false)}
      >
        <CriarCliente
          modoModal
          onCadastroSucesso={handleCadastroSucesso}
          onCancelar={() => setModalCadastroAberto(false)}
        />
      </ModalFormulario>
    </div>
  );
}
