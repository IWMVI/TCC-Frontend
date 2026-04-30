import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { Botao, Card, Tabela, Modal, Busca, Paginacao } from '@interfaces-graficas/componentes';
import type { Coluna } from '@interfaces-graficas/componentes/data/Tabela';
import { ModalVisualizacaoImagem } from '@interfaces-graficas/componentes/feedback/ModalVisualizacaoImagem';
import { ErrorMessage } from '@interfaces-graficas/componentes/feedback/ErrorMessage';
import { useTrajes } from '@interfaces-graficas/contextos/ContextoTrajes';
import { TrajeResponse } from '@domain/entidades';
import { TRAJE_CONSTANTS } from '@application/trajes/TrajeDependencies';
import { AluguemApiRepository } from '@infrastructure/api';
import { FormularioDevolucao } from '@interfaces-graficas/paginas/alugueis/devolver/FormularioDevolucao';
import styles from './ListarTrajes.module.css';

export function ListarTrajes() {
  const navigate = useNavigate();
  const { estado, carregarTrajes, removerTraje, atualizarImagem, removerImagem, dispatch } = useTrajes();
  const [termoBusca, setTermoBusca] = useState('');
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [trajeParaExcluir, setTrajeParaExcluir] = useState<TrajeResponse | null>(null);
  const [estaExcluindo, setEstaExcluindo] = useState(false);
  const [modalImagemAberto, setModalImagemAberto] = useState(false);
  const [trajeSelecionado, setTrajeSelecionado] = useState<TrajeResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inicializou, setInicializou] = useState(false);

  // Devolução
  const aluguelRepositorio = useMemo(() => new AluguemApiRepository(), []);
  const [modalDevolucaoAberto, setModalDevolucaoAberto] = useState(false);
  const [aluguelIdParaDevolver, setAluguelIdParaDevolver] = useState<number | null>(null);
  const [estaBuscandoAluguel, setEstaBuscandoAluguel] = useState(false);

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

  const carregarDadosComDebounce = useMemo(
    () => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (busca?: string, pagina?: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => carregarDados(busca, pagina), TRAJE_CONSTANTS.DEBOUNCE_DELAY_MS);
      };
    },
    [carregarDados]
  );

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

  useEffect(() => {
    if (!inicializou) return;
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      carregarTrajes(termoBusca || undefined, 0);
    }, TRAJE_CONSTANTS.DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [termoBusca, carregarTrajes, inicializou]);

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
      carregarDados(termoBusca || undefined, estado.paginaAtual);
    } catch {
      dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao excluir traje' });
    } finally {
      setEstaExcluindo(false);
    }
  }, [trajeParaExcluir, removerTraje, fecharModalExclusao, carregarDados, termoBusca, estado.paginaAtual, dispatch]);

  const handlePageChange = useCallback(
    (pagina: number) => {
      carregarDados(termoBusca || undefined, pagina);
    },
    [carregarDados, termoBusca]
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
      setAluguelIdParaDevolver(aluguel.id);
      setModalDevolucaoAberto(true);
    } catch {
      dispatch({ tipo: 'SET_ERRO', payload: `Nenhum aluguel ativo encontrado para o traje "${traje.nome}"` });
    } finally {
      setEstaBuscandoAluguel(false);
    }
  }, [aluguelRepositorio, dispatch]);

  const handleAtualizarImagem = useCallback(
    async (trajeId: number, file: File) => {
      try {
        const novaUrl = await atualizarImagem(trajeId, file);
        setTrajeSelecionado((prev) => (prev ? { ...prev, imagem: novaUrl, imagemUrl: novaUrl } : null));
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao atualizar imagem' });
      }
    },
    [atualizarImagem, dispatch]
  );

  const handleRemoverImagem = useCallback(
    async (trajeId: number) => {
      try {
        await removerImagem(trajeId);
        setTrajeSelecionado((prev) => (prev ? { ...prev, imagem: '', imagemUrl: '' } : null));
      } catch {
        dispatch({ tipo: 'SET_ERRO', payload: 'Erro ao remover imagem' });
      }
    },
    [removerImagem, dispatch]
  );

  const colunas = useMemo<Coluna<TrajeResponse>[]>(
    () => [
      {
        chave: 'imagem' as const,
        titulo: 'Img',
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
        chave: 'acoes',
        titulo: 'Ações',
        render: (traje) => (
          <div className={styles['listar-trajes__acoes']}>
            <Link
              to={TRAJE_CONSTANTS.ROUTES.EDITAR(traje.id)}
              className={styles['listar-trajes__botao-editar']}
              title="Editar traje"
            >
              Editar
            </Link>
            {traje.status === 'ALUGADO' && (
              <button
                type="button"
                className={styles['listar-trajes__botao-devolver']}
                onClick={() => abrirDevolucao(traje)}
                disabled={estaBuscandoAluguel}
                title="Registrar devolução"
              >
                Devolver
              </button>
            )}
            <button
              type="button"
              className={styles['listar-trajes__botao-excluir']}
              onClick={() => abrirModalExclusao(traje)}
              title="Excluir traje"
            >
              Excluir
            </button>
          </div>
        ),
      },
    ],
    [abrirModalImagem, abrirModalExclusao, abrirDevolucao, estaBuscandoAluguel]
  );

  const handleVoltar = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const limparErro = useCallback(() => {
    dispatch({ tipo: 'SET_ERRO', payload: null });
  }, [dispatch]);

  return (
    <div className={styles['listar-trajes']}>
      <header className={styles['listar-trajes__header']}>
        <div className={styles['listar-trajes__navegacao']}>
          <button
            type="button"
            className={styles['listar-trajes__botao-voltar']}
            onClick={handleVoltar}
            title="Voltar para página anterior"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className={styles['listar-trajes__titulo']}>
            <h1 className={styles['listar-trajes__titulo-texto']}>Trajes</h1>
            <p className={styles['listar-trajes__titulo-subtitulo']}>Gerencie os trajes do sistema</p>
          </div>
        </div>
        <div className={styles['listar-trajes__acoes-header']}>
          <Link to={TRAJE_CONSTANTS.ROUTES.CRIAR}>
            <Botao>Novo Traje</Botao>
          </Link>
        </div>
      </header>

      <Card titulo="Lista de Trajes">
        <div className={styles['listar-trajes__busca']}>
          <Busca
            valor={termoBusca}
            onChange={setTermoBusca}
            placeholder="Buscar por nome, tamanho ou cor..."
            onSearch={(valor) => carregarDadosComDebounce(valor || undefined, 0)}
          />
        </div>

        {estado.erro && (
          <ErrorMessage mensagem={estado.erro} onDismiss={limparErro} />
        )}

        <div className={styles['listar-trajes__tabela-wrapper']}>
          <Tabela colunas={colunas} dados={estado.trajes} estaCarregando={estado.estaCarregando} />
        </div>

        <div className={styles['listar-trajes__paginacao']}>
          <Paginacao
            paginaAtual={estado.paginaAtual}
            totalPaginas={estado.totalPaginas || 1}
            totalRegistros={estado.totalRegistros}
            tamanhoPagina={estado.tamanhoPagina}
            onPageChange={handlePageChange}
          />
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

      {modalDevolucaoAberto && aluguelIdParaDevolver !== null && (
        <FormularioDevolucao
          aluguelId={aluguelIdParaDevolver}
          onSucesso={() => {
            setModalDevolucaoAberto(false);
            setAluguelIdParaDevolver(null);
            carregarDados(termoBusca || undefined, estado.paginaAtual);
          }}
          onCancelar={() => {
            setModalDevolucaoAberto(false);
            setAluguelIdParaDevolver(null);
          }}
        />
      )}
    </div>
  );
}
