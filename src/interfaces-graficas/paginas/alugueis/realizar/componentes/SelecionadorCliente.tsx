import { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ClienteResponse } from '../../../../../domain/entidades';
import { ListarClientesUseCase } from '../../../../../application/clientes';
import { ClienteApiRepository } from '../../../../../infrastructure/api';
import { Tabela, Busca } from '../../../../componentes';
import { mascararCpfCnpj, mascararCelular } from '../../../../utils/formatacoes';
import styles from './SelecionadorCliente.module.css';

const clienteRepositorio = new ClienteApiRepository();
const listarClientesUseCase = new ListarClientesUseCase(clienteRepositorio);

interface Props {
  clienteSelecionado: ClienteResponse | null;
  onClienteChange: (cliente: ClienteResponse | null) => void;
}

export function SelecionadorCliente({ clienteSelecionado, onClienteChange }: Props) {
  const [termoBuscaCPF, setTermoBuscaCPF] = useState('');
  const [termoBuscaNome, setTermoBuscaNome] = useState('');
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const carregarClientes = useCallback(
    async (busca?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setEstaCarregando(true);

      try {
        const resultado = await listarClientesUseCase.executar(busca, 0, 50);
        setClientes(resultado.content || []);
      } catch {
        setClientes([]);
      } finally {
        setEstaCarregando(false);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (termoBuscaCPF || termoBuscaNome) {
        carregarClientes(termoBuscaCPF || termoBuscaNome);
      } else {
        setClientes([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBuscaCPF, termoBuscaNome, carregarClientes]);

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
          onClick={() => onClienteChange(cliente)}
        >
          Selecionar
        </button>
      ),
    },
  ];

  return (
    <div className={styles.selecionadorCliente}>
      <div className={styles.buscas}>
        <div className={styles.campoBusca}>
          <label htmlFor="cpf-busca">CPF</label>
          <div className={styles.inputComícone}>
            <input
              id="cpf-busca"
              type="text"
              placeholder="Pesquisar por CPF..."
              value={termoBuscaCPF}
              onChange={(e) => setTermoBuscaCPF(e.target.value)}
              className={styles.input}
            />
            <Search size={18} className={styles.icone} />
          </div>
        </div>

        <div className={styles.campoBusca}>
          <label htmlFor="nome-busca">Nome</label>
          <div className={styles.inputComícone}>
            <input
              id="nome-busca"
              type="text"
              placeholder="Pesquisar por nome..."
              value={termoBuscaNome}
              onChange={(e) => setTermoBuscaNome(e.target.value)}
              className={styles.input}
            />
            <Search size={18} className={styles.icone} />
          </div>
        </div>
      </div>

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
              onClick={() => onClienteChange(null)}
            >
              Remover Seleção
            </button>
          </div>
        </div>
      )}

      {(termoBuscaCPF || termoBuscaNome) && (
        <div className={styles.resultados}>
          <h3>Resultados da Busca</h3>
          {estaCarregando ? (
            <p className={styles.mensagem}>Carregando...</p>
          ) : clientes.length === 0 ? (
            <p className={styles.mensagem}>Nenhum cliente encontrado</p>
          ) : (
            <Tabela colunas={colunas} dados={clientes} />
          )}
        </div>
      )}
    </div>
  );
}
