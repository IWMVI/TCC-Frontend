import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  Gavel,
  Percent,
  Receipt,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MetricaResumo } from '@/interfaces-graficas/componentes/base/MetricaResumo';
import { GraficoBarrasMensal } from '@/interfaces-graficas/componentes/dashboard/GraficoBarrasMensal';
import { BadgeStatusValor, Card, Tabela, type Coluna } from '@/interfaces-graficas/componentes';
import { useAutenticacao } from '@/interfaces-graficas/contextos/ContextoAutenticacao';
import { ObterResumoDashboardUseCase } from '@/application/dashboard/ObterResumoDashboardUseCase';
import { ObterSeriesMensaisDashboardUseCase } from '@/application/dashboard/ObterSeriesMensaisDashboardUseCase';
import { DashboardApiRepository } from '@/infrastructure/api/DashboardApiRepository';
import { AluguelResumoItem, DashboardResumo, SerieMensalDashboard } from '@/domain/entidades/Dashboard';
import { METRICAS_DASHBOARD } from '@/domain/entidades/MetricaDashboard';
import { formatarDataBr, formatarDataHojeExtensoBr } from '@/interfaces-graficas/utils/formatarData';
import { formatarMoeda } from '@/interfaces-graficas/utils/formatarMoeda';
import { graficoDashboardMoeda } from '@/interfaces-graficas/paginas/dashboard/configGraficoDashboard';
import { formatarNumeroEixoGrafico } from '@/interfaces-graficas/utils/formatarNumeroEixoGrafico';
import { formatarNumeroCompacto } from '@/interfaces-graficas/utils/formatarValorCompacto';
import styles from '@/interfaces-graficas/paginas/dashboard/Dashboard/Dashboard.module.css';

const dashboardRepository = new DashboardApiRepository();
const obterResumoUseCase = new ObterResumoDashboardUseCase(dashboardRepository);
const obterSeriesMensaisUseCase = new ObterSeriesMensaisDashboardUseCase(dashboardRepository);

const MESES_GRAFICO = 12;

const colunasUltimosAlugueis: Coluna<AluguelResumoItem>[] = [
  { chave: 'id', titulo: 'ID', width: '12%' },
  { chave: 'nomeCliente', titulo: 'Cliente', tipo: 'texto', width: '36%' },
  {
    chave: 'dataAluguel',
    titulo: 'Data',
    width: '16%',
    render: (item) => formatarDataBr(item.dataAluguel),
  },
  {
    chave: 'valorTotal',
    titulo: 'Valor',
    width: '18%',
    render: (item) => formatarMoeda(Number(item.valorTotal ?? 0)),
  },
  {
    chave: 'status',
    titulo: 'Status',
    width: '18%',
    render: (item) => <BadgeStatusValor status={item.status} />,
  },
];

export function Dashboard() {
  const { funcionario } = useAutenticacao();
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [seriesMensais, setSeriesMensais] = useState<SerieMensalDashboard[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const rotasPorTipo = useMemo(
    () => Object.fromEntries(METRICAS_DASHBOARD.map((metrica) => [metrica.tipo, metrica.rota])),
    [],
  );

  const dadosReceita = useMemo(
    () => seriesMensais.map((ponto) => ({ mes: ponto.mes, valor: Number(ponto.receita) })),
    [seriesMensais],
  );

  const dadosAlugueis = useMemo(
    () =>
      seriesMensais.map((ponto) => ({
        mes: ponto.mes,
        valor: ponto.quantidadeAlugueis,
      })),
    [seriesMensais],
  );

  const dadosMultas = useMemo(
    () => seriesMensais.map((ponto) => ({ mes: ponto.mes, valor: Number(ponto.multas) })),
    [seriesMensais],
  );

  const dadosDescontos = useMemo(
    () => seriesMensais.map((ponto) => ({ mes: ponto.mes, valor: Number(ponto.descontos) })),
    [seriesMensais],
  );

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const [resumoDados, series] = await Promise.all([
          obterResumoUseCase.executar(),
          obterSeriesMensaisUseCase.executar(MESES_GRAFICO),
        ]);
        setResumo(resumoDados);
        setSeriesMensais(series);
      } catch {
        setErro('Não foi possível carregar o dashboard.');
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, []);

  const nomeExibicao = funcionario?.nome ?? 'Funcionário';
  const dataHoje = formatarDataHojeExtensoBr();

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboard__cabecalho}>
        <div>
          <p className={styles.dashboard__saudacao}>Painel geral</p>
          <h1 className={styles.dashboard__titulo}>Olá, {nomeExibicao}</h1>
          <p className={styles.dashboard__subtitulo}>{dataHoje}</p>
        </div>
        <Link to="/alugueis/listar" className={styles.dashboard__link_acao}>
          Ver todos os aluguéis
        </Link>
      </header>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {carregando && <p className={styles.dashboard__carregando}>Carregando indicadores...</p>}

      {resumo && !carregando && (
        <>
          <section className={styles.dashboard__secao} aria-label="Indicadores principais">
            <h2 className={styles.dashboard__secao_titulo}>Operação</h2>
            <div className={styles.dashboard__metricas}>
              <MetricaResumo
                icone={<CheckCircle size={26} strokeWidth={1.5} />}
                valor={resumo.alugueisAtivos}
                rotulo="Aluguéis ativos"
                rota={rotasPorTipo['alugueis-ativos']}
              />
              <MetricaResumo
                icone={<AlertTriangle size={26} strokeWidth={1.5} />}
                valor={resumo.alugueisEmAtraso}
                rotulo="Em atraso"
                rota={rotasPorTipo['em-atraso']}
              />
              <MetricaResumo
                icone={<Receipt size={26} strokeWidth={1.5} />}
                valor={resumo.alugueisConcluidos}
                rotulo="Concluídos"
              />
              <MetricaResumo
                icone={<Ban size={26} strokeWidth={1.5} />}
                valor={resumo.alugueisCancelados}
                rotulo="Cancelados"
              />
            </div>
          </section>

          <section className={styles.dashboard__secao} aria-label="Indicadores financeiros">
            <h2 className={styles.dashboard__secao_titulo}>Financeiro</h2>
            <div className={styles.dashboard__metricas}>
              <MetricaResumo
                icone={<Wallet size={26} strokeWidth={1.5} />}
                valor={formatarMoeda(Number(resumo.receitaMesAtual))}
                rotulo="Receita do mês"
                rota={rotasPorTipo['receita-mes']}
              />
              <MetricaResumo
                icone={<DollarSign size={26} strokeWidth={1.5} />}
                valor={formatarMoeda(Number(resumo.receitaPendente))}
                rotulo="Receita pendente"
                rota={rotasPorTipo['receita-pendente']}
              />
              <MetricaResumo
                icone={<Gavel size={26} strokeWidth={1.5} />}
                valor={formatarMoeda(Number(resumo.totalMultas))}
                rotulo="Multas (acumulado)"
                rota={rotasPorTipo.multas}
              />
              <MetricaResumo
                icone={<Percent size={26} strokeWidth={1.5} />}
                valor={formatarMoeda(Number(resumo.totalDescontos))}
                rotulo="Descontos (acumulado)"
                rota={rotasPorTipo.descontos}
              />
            </div>
          </section>

          <section className={styles.dashboard__secao} aria-label="Gráficos mensais">
            <h2 className={styles.dashboard__secao_titulo}>Últimos {MESES_GRAFICO} meses</h2>
            <div className={styles.dashboard__graficos}>
              <Card
                titulo="Receita mensal (concluídos)"
                className={styles.dashboard__grafico_card}
                icone={<TrendingUp size={20} strokeWidth={1.75} />}
              >
                <GraficoBarrasMensal dados={dadosReceita} {...graficoDashboardMoeda} />
              </Card>
              <Card
                titulo="Aluguéis realizados"
                className={styles.dashboard__grafico_card}
                icone={<ClipboardList size={20} strokeWidth={1.75} />}
              >
                <GraficoBarrasMensal
                  dados={dadosAlugueis}
                  formatarValor={formatarNumeroCompacto}
                  formatarEixo={formatarNumeroEixoGrafico}
                  tom={graficoDashboardMoeda.tom}
                  escala={graficoDashboardMoeda.escala}
                />
              </Card>
              <Card
                titulo="Multas por mês"
                className={styles.dashboard__grafico_card}
                icone={<Gavel size={20} strokeWidth={1.75} />}
              >
                <GraficoBarrasMensal dados={dadosMultas} {...graficoDashboardMoeda} />
              </Card>
              <Card
                titulo="Descontos por mês"
                className={styles.dashboard__grafico_card}
                icone={<Tag size={20} strokeWidth={1.75} />}
              >
                <GraficoBarrasMensal dados={dadosDescontos} {...graficoDashboardMoeda} />
              </Card>
            </div>
          </section>

          <section className={styles.dashboard__secao} aria-label="Últimos aluguéis">
            <Card
              titulo="Últimos aluguéis registrados"
              icone={<Clock size={20} strokeWidth={1.75} />}
              className={styles.dashboard__tabela_card}
            >
              {resumo.ultimosAlugueis.length === 0 ? (
                <p className={styles.dashboard__vazio}>Nenhum aluguel registrado ainda.</p>
              ) : (
                <Tabela
                  colunas={colunasUltimosAlugueis}
                  dados={resumo.ultimosAlugueis}
                  preencherLinhas={false}
                  alinharAoCentro
                />
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
