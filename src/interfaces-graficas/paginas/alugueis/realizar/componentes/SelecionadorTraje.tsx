import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { PeriodoAlugado, Traje } from '@domain/entidades';
import { ListarTrajesUseCase } from '@application/trajes';
import { TrajeApiRepository } from '@infrastructure/api';
import { CriarTraje } from '@/interfaces-graficas/paginas/trajes/criar/CriarTraje/CriarTraje';
import { Botao } from '@/interfaces-graficas/componentes';
import { ModalFormulario } from '@/interfaces-graficas/componentes/feedback/ModalFormulario/ModalFormulario';
import styles from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorTraje.module.css';

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

import { dataDentroDePeriodoReservado, normalizarPeriodosAlugados } from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';

// ─── helpers de calendário ────────────────────────────────────────────────────

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function isoParaDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dataDentroDeAlgumPeriodo(date: Date, periodos: PeriodoAlugado[]): boolean {
  const dataIso = toIsoDateLocal(date);
  return dataDentroDePeriodoReservado(dataIso, periodos);
}

function toIsoDateLocal(date: Date): string {
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mes}-${dia}`;
}

function gerarSemanas(ano: number, mes: number): (Date | null)[][] {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const semanas: (Date | null)[][] = [];
  let semanaAtual: (Date | null)[] = Array(primeiroDia.getDay()).fill(null);

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    semanaAtual.push(new Date(ano, mes, d));
    if (semanaAtual.length === 7) {
      semanas.push(semanaAtual);
      semanaAtual = [];
    }
  }
  if (semanaAtual.length > 0) {
    while (semanaAtual.length < 7) semanaAtual.push(null);
    semanas.push(semanaAtual);
  }
  return semanas;
}

// ─── Mini calendário (renderizado dentro do popover) ─────────────────────────

interface MiniCalendarioProps {
  periodos: PeriodoAlugado[];
  carregando: boolean;
}

function MiniCalendario({ periodos, carregando }: MiniCalendarioProps) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const meses = [
    { ano: hoje.getFullYear(), mes: hoje.getMonth() },
    {
      ano: hoje.getMonth() === 11 ? hoje.getFullYear() + 1 : hoje.getFullYear(),
      mes: (hoje.getMonth() + 1) % 12,
    },
  ];

  if (carregando) {
    return (
      <div className={styles.calCarregando}>
        <span className={styles.calSpinner} />
        <span className={styles.calCarregandoTexto}>Verificando disponibilidade…</span>
      </div>
    );
  }

  return (
    <div className={styles.calWrapper}>
      {meses.map(({ ano, mes }) => {
        const semanas = gerarSemanas(ano, mes);
        return (
          <div key={`${ano}-${mes}`} className={styles.calMes}>
            <div className={styles.calMesTitulo}>
              {MESES[mes]} {ano}
            </div>
            <div className={styles.calGrid}>
              {DIAS_SEMANA.map((d, i) => (
                <span key={i} className={styles.calDiaSemana}>
                  {d}
                </span>
              ))}
              {semanas.flat().map((date, i) => {
                if (!date) return <span key={i} className={styles.calVazio} />;
                const passado = date < hoje;
                const ocupado = dataDentroDeAlgumPeriodo(date, periodos);
                const ehHoje = date.toDateString() === hoje.toDateString();

                let cls = styles.calDia;
                if (passado) cls += ` ${styles.calDiaPassado}`;
                else if (ocupado) cls += ` ${styles.calDiaOcupado}`;
                else cls += ` ${styles.calDiaLivre}`;
                if (ehHoje) cls += ` ${styles.calDiaHoje}`;

                return (
                  <span
                    key={i}
                    className={cls}
                    title={ocupado ? 'Ocupado' : passado ? '' : 'Disponível'}
                  >
                    {date.getDate()}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Botão de disponibilidade com popover de calendário ──────────────────────

interface BotaoDisponibilidadeProps {
  periodos: PeriodoAlugado[];
  carregando: boolean;
}

function BotaoDisponibilidade({ periodos, carregando }: BotaoDisponibilidadeProps) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState<{ top: number; left: number; abrirParaCima: boolean }>({
    top: 0,
    left: 0,
    abrirParaCima: false,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    function handleClick(e: MouseEvent) {
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [aberto]);

  function togglePopover() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popoverAltura = 280;
    const espacoAbaixo = window.innerHeight - rect.bottom;
    const abrirParaCima = espacoAbaixo < popoverAltura + 16;

    setPosicao({
      // Se abre para cima: ancora no topo do botão e subtrai a altura do popover
      // Se abre para baixo: ancora no bottom do botão
      top: abrirParaCima ? rect.top - popoverAltura - 6 : rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - 340),
      abrirParaCima,
    });
    setAberto((v) => !v);
  }

  const temReserva = !carregando && periodos.length > 0;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.btnDisponibilidade} ${
          carregando
            ? styles.btnDisponibilidadeCarregando
            : temReserva
              ? styles.btnDisponibilidadeOcupado
              : styles.btnDisponibilidadeLivre
        }`}
        onClick={togglePopover}
        aria-expanded={aberto}
        title="Ver disponibilidade no calendário"
      >
        {carregando ? (
          <span className={styles.calSpinner} />
        ) : temReserva ? (
          <>
            <AlertCircle size={12} /> {periodos.length} reserva{periodos.length > 1 ? 's' : ''}
          </>
        ) : (
          <>
            <CheckCircle2 size={12} /> Livre
          </>
        )}
        <Calendar size={11} className={styles.btnDisponibilidadeIconeCal} />
      </button>

      {aberto &&
        createPortal(
          <div
            ref={popRef}
            className={`${styles.popover} ${posicao.abrirParaCima ? styles.popoverCima : styles.popoverBaixo}`}
            style={{
              top: posicao.abrirParaCima ? posicao.top - 8 : posicao.top,
              left: posicao.left,
            }}
            role="dialog"
            aria-label="Calendário de disponibilidade"
          >
            <div className={styles.popoverTitulo}>
              {temReserva ? '🔴 Datas reservadas' : '🟢 Sem reservas ativas'}
            </div>
            <MiniCalendario periodos={periodos} carregando={carregando} />
            <div className={styles.calLegenda}>
              <span className={styles.calLegendaLivre}>Disponível</span>
              <span className={styles.calLegendaOcupado}>Ocupado</span>
              <span className={styles.calLegendaPassado}>Passado</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SelecionadorTraje({
  itensSelecionados,
  onAdicionarTraje,
  onRemoverTraje,
}: Readonly<Props>) {
  const [termoBusca, setTermoBusca] = useState('');
  const [trajes, setTrajes] = useState<Traje[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [trajeSelecionado, setTrajeSelecionado] = useState<Traje | null>(null);
  const [periodosAlugados, setPeriodosAlugados] = useState<PeriodoAlugado[]>([]);
  const [estaBuscandoPeriodos, setEstaBuscandoPeriodos] = useState(false);
  const [buscaSemResultados, setBuscaSemResultados] = useState(false);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);

  const [periodosMap, setPeriodosMap] = useState<Record<number, PeriodoAlugado[]>>({});
  const [periodosMapCarregando, setPeriodosMapCarregando] = useState<Record<number, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);

  const carregarTrajes = useCallback(async (busca?: string) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setEstaCarregando(true);
    setBuscaSemResultados(false);
    setPeriodosMap({});
    setPeriodosMapCarregando({});
    const termoAtual = busca?.trim() ?? '';

    try {
      const resultado = await listarTrajesUseCase.executar(busca, 0, 50);
      const lista = resultado.content || [];
      setTrajes(lista);
      setBuscaSemResultados(termoAtual.length > 0 && lista.length === 0);

      if (lista.length > 0) {
        const carregandoInicial: Record<number, boolean> = {};
        lista.forEach((t) => {
          if (t.id) carregandoInicial[t.id] = true;
        });
        setPeriodosMapCarregando(carregandoInicial);

        await Promise.allSettled(
          lista.map(async (t) => {
            if (!t.id) return;
            try {
              const periodos = normalizarPeriodosAlugados(
                await trajeRepositorio.buscarPeriodosAlugados(t.id),
              );
              setPeriodosMap((prev) => ({ ...prev, [t.id!]: periodos }));
            } finally {
              setPeriodosMapCarregando((prev) => ({ ...prev, [t.id!]: false }));
            }
          })
        );
      }
    } catch {
      setTrajes([]);
      setBuscaSemResultados(false);
    } finally {
      setEstaCarregando(false);
    }
  }, []);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (termoBusca) carregarTrajes(termoBusca);
      else {
        setTrajes([]);
        setBuscaSemResultados(false);
        setPeriodosMap({});
      }
    }, 300);
    return () => clearTimeout(id);
  }, [termoBusca, carregarTrajes]);

  async function handleSelecionarTraje(traje: Traje) {
    setTrajeSelecionado(traje);
    if (traje.id && periodosMap[traje.id] !== undefined) {
      setPeriodosAlugados(periodosMap[traje.id]);
      return;
    }
    if (!traje.id) return;
    setEstaBuscandoPeriodos(true);
    try {
      const periodos = normalizarPeriodosAlugados(
        await trajeRepositorio.buscarPeriodosAlugados(traje.id),
      );
      setPeriodosAlugados(periodos);
    } catch {
      setPeriodosAlugados([]);
    } finally {
      setEstaBuscandoPeriodos(false);
    }
  }

  function handleAdicionarTraje() {
    if (!trajeSelecionado) return;
    onAdicionarTraje(trajeSelecionado);
    setTrajeSelecionado(null);
    setPeriodosAlugados([]);
  }

  function handleCancelarSelecao() {
    setTrajeSelecionado(null);
    setPeriodosAlugados([]);
  }

  function handleCadastroSucesso(traje: Traje) {
    setModalCadastroAberto(false);
    setTrajeSelecionado(null);
    setPeriodosAlugados([]);
    setTermoBusca('');
    setTrajes([]);
    setBuscaSemResultados(false);
    setPeriodosMap({});
    onAdicionarTraje(traje);
  }

  const exibeResultados = termoBusca && !trajeSelecionado;

  return (
    <div className={styles.selecionadorTraje}>
      {/* ── Busca ── */}
      <div className={styles.busca}>
        <label htmlFor="busca-traje">Pesquisar Traje</label>
        <div className={styles.inputComIcone}>
          <input
            id="busca-traje"
            type="text"
            placeholder="Digite o nome do traje..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className={styles.input}
          />
          <Search size={18} className={styles.icone} />
        </div>
      </div>

      {/* ── Painel de confirmação ── */}
      {trajeSelecionado && (
        <div className={styles.trajeTemporario}>
          <div className={styles.trajeTemporarioTopo}>
            <div className={styles.cardFoto}>
              {trajeSelecionado.imagem || trajeSelecionado.imagemUrl ? (
                <img
                  src={trajeSelecionado.imagem ?? trajeSelecionado.imagemUrl}
                  alt={trajeSelecionado.nome}
                  className={styles.cardFotoImg}
                />
              ) : (
                <div className={styles.cardFotoPlaceholder} aria-hidden="true">
                  <span>👔</span>
                </div>
              )}
            </div>
            <div className={styles.infoTraje}>
              <h4>{trajeSelecionado.nome}</h4>
              <p>
                Tipo: {trajeSelecionado.tipo} · Tamanho: {trajeSelecionado.tamanho}
              </p>
            </div>
            <BotaoDisponibilidade periodos={periodosAlugados} carregando={estaBuscandoPeriodos} />
          </div>
          <div className={styles.acoes}>
            <Botao tipo="primario" onClick={handleAdicionarTraje}>
              Adicionar
            </Botao>
            <Botao tipo="secundario" onClick={handleCancelarSelecao}>
              Cancelar
            </Botao>
          </div>
        </div>
      )}

      {/* ── Resultados ── */}
      {exibeResultados && (
        <div className={styles.resultados}>
          <h3>Resultados da Busca</h3>
          {estaCarregando ? (
            <p className={styles.mensagem}>Carregando...</p>
          ) : trajes.length === 0 ? (
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
          ) : (
            <ul className={styles.cardLista}>
              {trajes.map((traje) => {
                const id = traje.id!;
                const periodos = periodosMap[id] ?? [];
                const carregandoPeriodo = periodosMapCarregando[id] ?? false;

                return (
                  <li key={id} className={styles.card}>
                    <div className={styles.cardTopo}>
                      <div className={styles.cardFoto}>
                        {traje.imagem || traje.imagemUrl ? (
                          <img
                            src={traje.imagem ?? traje.imagemUrl}
                            alt={traje.nome}
                            className={styles.cardFotoImg}
                          />
                        ) : (
                          <div className={styles.cardFotoPlaceholder} aria-hidden="true">
                            <span>👔</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardNome}>{traje.nome}</span>
                        <span className={styles.cardMeta}>
                          {traje.tipo} · {traje.tamanho} · {traje.cor}
                        </span>
                        {traje.preco != null && (
                          <span className={styles.cardPreco}>R$ {traje.preco.toFixed(2)}</span>
                        )}
                      </div>
                      <div className={styles.cardAcoes}>
                        <BotaoDisponibilidade periodos={periodos} carregando={carregandoPeriodo} />
                        <button
                          type="button"
                          className={styles.botaoSelecionar}
                          onClick={() => handleSelecionarTraje(traje)}
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Trajes adicionados ── */}
      <div className={styles.itensSelecionados}>
        <h3>Trajes Selecionados ({itensSelecionados.length})</h3>
        {itensSelecionados.length === 0 ? (
          <p className={styles.mensagem}>Nenhum traje selecionado</p>
        ) : (
          <div className={styles.lista}>
            {itensSelecionados.map((item, index) => (
              <div key={item.trajeId} className={styles.itemLista}>
                <div className={styles.cardFoto}>
                  {item.traje.imagem || item.traje.imagemUrl ? (
                    <img
                      src={item.traje.imagem ?? item.traje.imagemUrl}
                      alt={item.traje.nome}
                      className={styles.cardFotoImg}
                    />
                  ) : (
                    <div className={styles.cardFotoPlaceholder} aria-hidden="true">
                      <span>👔</span>
                    </div>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.nomeTraje}>{item.traje.nome}</p>
                  <p className={styles.detalhes}>
                    <span>
                      {item.traje.tipo} · {item.traje.tamanho}
                    </span>
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
