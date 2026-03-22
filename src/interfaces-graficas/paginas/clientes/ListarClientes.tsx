import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Botao, Card, Tabela, Modal, Busca } from '../../componentes';
import { useClientes } from '../../contextos/ContextoClientes';
import { ListarClientesUseCase, DeletarClienteUseCase } from '../../../application/clientes';
import { ClienteApiRepositorio } from '../../../infrastructure/api';
import { ClienteResponse } from '../../../domain/entidades';
import { mascararCpfCnpj, mascararCelular } from '../../utils/formatacoes';
import './ListarClientes.css';

const clienteRepositorio = new ClienteApiRepositorio();
const listarClientesUseCase = new ListarClientesUseCase(clienteRepositorio);
const deletarClienteUseCase = new DeletarClienteUseCase(clienteRepositorio);

export function ListarClientes() {
  const { estado, dispatch } = useClientes();
  const [termoBusca, setTermoBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);

  const carregarClientes = useCallback(async (busca?: string) => {
    dispatch({ tipo: 'SET_CARREGANDO', payload: true });
    dispatch({ tipo: 'SET_ERRO', payload: null });
    try {
      const clientes = await listarClientesUseCase.executar(busca);
      dispatch({ tipo: 'SET_CLIENTES', payload: clientes });
    } catch (erro) {
      dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao carregar clientes' });
    } finally {
      dispatch({ tipo: 'SET_CARREGANDO', payload: false });
    }
  }, [dispatch]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (termoBusca || estado.clientes.length > 0) {
        carregarClientes(termoBusca || undefined);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarClientes, estado.clientes.length]);

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
    } catch (erro) {
      dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao excluir cliente' });
    } finally {
      setEstaExcluindo(false);
    }
  }

  const colunas = [
    { chave: 'id' as keyof ClienteResponse, titulo: 'ID' },
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
      render: (cliente: ClienteResponse) => (
        <div className="listar-clientes__acoes">
          <Link to={`/clientes/${cliente.id}/editar`} className="listar-clientes__botao-editar">
            Editar
          </Link>
          <button
            type="button"
            className="listar-clientes__botao-excluir"
            onClick={() => abrirModalExclusao(cliente)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="listar-clientes">
      <header className="listar-clientes__header">
        <div className="listar-clientes__titulo">
          <h1>Clientes</h1>
          <p>Gerencie os clientes do sistema</p>
        </div>
        <Link to="/clientes/novo">
          <Botao>Novo Cliente</Botao>
        </Link>
      </header>

      <Card titulo="Lista de Clientes">
        <div className="listar-clientes__busca">
          <Busca
            valor={termoBusca}
            onChange={setTermoBusca}
            placeholder="Buscar por nome, CPF ou e-mail..."
            onSearch={(valor) => carregarClientes(valor || undefined)}
          />
        </div>

        {estado.erro && (
          <div className="listar-clientes__erro">{estado.erro}</div>
        )}

        <Tabela
          colunas={colunas}
          dados={estado.clientes}
          estaCarregando={estado.estaCarregando}
        />
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
