import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Traje } from '../../../../../domain/entidades';
import { ListarTrajesUseCase } from '../../../../../application/trajes';
import { TrajeApiRepository } from '../../../../../infrastructure/api';
import { CriarTraje } from '../../../trajes/criar/CriarTraje/CriarTraje';
import { Botao, Tabela } from '../../../../componentes';
import { ModalFormulario } from '../../../../componentes/feedback/ModalFormulario/ModalFormulario';
import styles from './SelecionadorTraje.module.css';

const trajeRepositorio = new TrajeApiRepository();
const listarTrajesUseCase = new ListarTrajesUseCase(trajeRepositorio);

interface ItemSelecionado {
  trajeId: number;
  traje: Traje;
}

interface Props {
  itensSelecionados: ItemSelecionado[];
  onAdicionarTraje: (traje: Traje) => void;
  onRemoverTraje: (index: number) => void;
}

export function SelecionadorTraje({
  itensSelecionados,
  onAdicionarTraje,
  onRemoverTraje,
}: Readonly<Props>) {
  const [termoBusca, setTermoBusca] = useState('');
  const [trajes, setTrajes] = useState<Traje[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [trajeSelecionado, setTrajeSelecionado] = useState<Traje | null>(null);
  const [buscaSemResultados, setBuscaSemResultados] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const carregarTrajes = useCallback(async (busca?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setEstaCarregando(true);
    setBuscaSemResultados(false);
    const termoAtual = busca?.trim() ?? '';

    try {
      const resultado = await listarTrajesUseCase.executar(busca, 0, 50);
      const lista = resultado.content || [];
      setTrajes(lista);
      setBuscaSemResultados(termoAtual.length > 0 && lista.length === 0);
    } catch {
      setTrajes([]);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (termoBusca) {
        carregarTrajes(termoBusca);
      } else {
        setTrajes([]);
        setBuscaSemResultados(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarTrajes]);

  function handleAdicionarTraje() {
    if (!trajeSelecionado) {
      return;
    }

    onAdicionarTraje(trajeSelecionado);
    setTrajeSelecionado(null);
  }

  function handleCadastroSucesso(traje: Traje) {
    setModalCadastroAberto(false);
    setTrajeSelecionado(null);
    setTermoBusca('');
    setTrajes([]);
    setBuscaSemResultados(false);
    onAdicionarTraje(traje);
  }

  const colunas = [
    { chave: 'id' as keyof Traje, titulo: 'ID', width: '60px' },
    { chave: 'codigo' as keyof Traje, titulo: 'Codigo' },
    { chave: 'nome' as keyof Traje, titulo: 'Nome' },
    { chave: 'tipo' as keyof Traje, titulo: 'Tipo' },
    { chave: 'cor' as keyof Traje, titulo: 'Cor' },
    { chave: 'tamanho' as keyof Traje, titulo: 'Tamanho' },
    {
      chave: 'acoes' as keyof Traje,
      titulo: 'Acoes',
      width: '100px',
      render: (traje: Traje) => (
        <button
          type="button"
          className={styles.botaoSelecionar}
          onClick={() => setTrajeSelecionado(traje)}
        >
          Selecionar
        </button>
      ),
    },
  ];

  const exibeResultados = termoBusca && !trajeSelecionado;
  let conteudoResultados: JSX.Element | null = null;

  if (estaCarregando) {
    conteudoResultados = <p className={styles.mensagem}>Carregando...</p>;
  } else if (trajes.length === 0) {
    conteudoResultados = (
      <div className={styles.semResultados}>
        <p className={styles.mensagem}>Nenhum traje encontrado</p>
        {buscaSemResultados && (
          <button
            type="button"
            className={styles.botaoCadastrar}
            onClick={() => setModalCadastroAberto(true)}
          >
            Cadastrar traje
          </button>
        )}
      </div>
    );
  } else {
    conteudoResultados = <Tabela colunas={colunas} dados={trajes} />;
  }

  return (
    <div className={styles.selecionadorTraje}>
      <div className={styles.busca}>
        <label htmlFor="busca-traje">Pesquisar Traje</label>
        <div className={styles.inputComIcone}>
          <input
            id="busca-traje"
            type="text"
            placeholder="Digite o nome ou codigo do traje..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className={styles.input}
          />
          <Search size={18} className={styles.icone} />
        </div>
      </div>

      {trajeSelecionado && (
        <div className={styles.trajeTemporario}>
          <div className={styles.infoTraje}>
            <h4>{trajeSelecionado.nome}</h4>
            <p>Codigo: {trajeSelecionado.codigo}</p>
            <p>Tipo: {trajeSelecionado.tipo}</p>
            <p>Tamanho: {trajeSelecionado.tamanho}</p>
          </div>

          <div className={styles.acoes}>
            <Botao tipo="primario" onClick={handleAdicionarTraje}>
              Adicionar
            </Botao>
            <Botao tipo="secundario" onClick={() => setTrajeSelecionado(null)}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      {exibeResultados && (
        <div className={styles.resultados}>
          <h3>Resultados da Busca</h3>
          {conteudoResultados}
        </div>
      )}

      <div className={styles.itensSelecionados}>
        <h3>Trajes Selecionados ({itensSelecionados.length})</h3>
        {itensSelecionados.length === 0 ? (
          <p className={styles.mensagem}>Nenhum traje selecionado</p>
        ) : (
          <div className={styles.lista}>
            {itensSelecionados.map((item, index) => (
              <div key={item.trajeId} className={styles.itemLista}>
                <div className={styles.infoItem}>
                  <p className={styles.nomeTraje}>{item.traje.nome}</p>
                  <p className={styles.detalhes}>
                    <span>{item.traje.codigo}</span>
                    <span>R$ {item.traje.preco?.toFixed(2)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.botaoRemover}
                  onClick={() => onRemoverTraje(index)}
                  title="Remover traje"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalFormulario
        titulo="Cadastrar Traje"
        estaAberto={modalCadastroAberto}
        aoFechar={() => setModalCadastroAberto(false)}
      >
        <CriarTraje
          modoModal
          onCadastroSucesso={handleCadastroSucesso}
          onCancelar={() => setModalCadastroAberto(false)}
        />
      </ModalFormulario>
    </div>
  );
}
