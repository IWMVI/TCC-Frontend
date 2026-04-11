import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Traje } from '../../../../../domain/entidades';
import { ListarTrajesUseCase } from '../../../../../application/trajes';
import { TrajeApiRepository } from '../../../../../infrastructure/api';
import { Botao, Tabela } from '../../../../componentes';
import styles from './SelecionadorTraje.module.css';

const trajeRepositorio = new TrajeApiRepository();
const listarTrajesUseCase = new ListarTrajesUseCase(trajeRepositorio);

interface ItemSelecionado {
  trajeId: number;
  traje: Traje;
  tamanho: string;
}

interface Props {
  itensSelecionados: ItemSelecionado[];
  onAdicionarTraje: (traje: Traje, tamanho: string) => void;
  onRemoverTraje: (index: number) => void;
}

export function SelecionadorTraje({ itensSelecionados, onAdicionarTraje, onRemoverTraje }: Props) {
  const [termoBusca, setTermoBusca] = useState('');
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [trajes, setTrajes] = useState<Traje[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [trajeSelecionado, setTrajeSelecionado] = useState<Traje | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const carregarTrajes = useCallback(
    async (busca?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setEstaCarregando(true);

      try {
        const resultado = await listarTrajesUseCase.executar(busca, 0, 50);
        setTrajes(resultado.content || []);
      } catch {
        setTrajes([]);
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
      if (termoBusca) {
        carregarTrajes(termoBusca);
      } else {
        setTrajes([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarTrajes]);

  function handleAdicionarTraje() {
    if (!trajeSelecionado || !tamanhoSelecionado) {
      return;
    }

    onAdicionarTraje(trajeSelecionado, tamanhoSelecionado);
    setTrajeSelecionado(null);
    setTamanhoSelecionado('');
    setTermoBusca('');
    setTrajes([]);
  }

  const colunas = [
    { chave: 'id' as keyof Traje, titulo: 'ID', width: '60px' },
    { chave: 'codigo' as keyof Traje, titulo: 'Código' },
    { chave: 'nome' as keyof Traje, titulo: 'Nome' },
    { chave: 'tipo' as keyof Traje, titulo: 'Tipo' },
    { chave: 'cor' as keyof Traje, titulo: 'Cor' },
    { chave: 'tamanho' as keyof Traje, titulo: 'Tamanho' },
    {
      chave: 'acoes' as keyof Traje,
      titulo: 'Ações',
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

  return (
    <div className={styles.selecionadorTraje}>
      <div className={styles.busca}>
        <label htmlFor="busca-traje">Pesquisar Traje</label>
        <div className={styles.inputComícone}>
          <input
            id="busca-traje"
            type="text"
            placeholder="Digite o nome ou código do traje..."
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
            <p>Código: {trajeSelecionado.codigo}</p>
            <p>Tipo: {trajeSelecionado.tipo}</p>
            <p>Tamanho padrão: {trajeSelecionado.tamanho}</p>
          </div>

          <div className={styles.tamanhoInput}>
            <label htmlFor="tamanho-select">Tamanho do Cliente</label>
            <select
              id="tamanho-select"
              value={tamanhoSelecionado}
              onChange={(e) => setTamanhoSelecionado(e.target.value)}
              className={styles.select}
            >
              <option value="">Selecione um tamanho</option>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
              <option value="XG">XG</option>
            </select>
          </div>

          <div className={styles.acoes}>
            <Botao
              tipo="primario"
              onClick={handleAdicionarTraje}
              disabled={!tamanhoSelecionado}
            >
              Adicionar
            </Botao>
            <Botao
              tipo="secundario"
              onClick={() => {
                setTrajeSelecionado(null);
                setTamanhoSelecionado('');
              }}
            >
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      {(termoBusca && !trajeSelecionado) && (
        <div className={styles.resultados}>
          <h3>Resultados da Busca</h3>
          {estaCarregando ? (
            <p className={styles.mensagem}>Carregando...</p>
          ) : trajes.length === 0 ? (
            <p className={styles.mensagem}>Nenhum traje encontrado</p>
          ) : (
            <Tabela colunas={colunas} dados={trajes} />
          )}
        </div>
      )}

      <div className={styles.itensSelecionados}>
        <h3>Trajes Selecionados ({itensSelecionados.length})</h3>
        {itensSelecionados.length === 0 ? (
          <p className={styles.mensagem}>Nenhum traje selecionado</p>
        ) : (
          <div className={styles.lista}>
            {itensSelecionados.map((item, index) => (
              <div key={index} className={styles.itemLista}>
                <div className={styles.infoItem}>
                  <p className={styles.nomeTraje}>{item.traje.nome}</p>
                  <p className={styles.detalhes}>
                    <span>{item.traje.codigo}</span>
                    <span>Tamanho: {item.tamanho}</span>
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
    </div>
  );
}
