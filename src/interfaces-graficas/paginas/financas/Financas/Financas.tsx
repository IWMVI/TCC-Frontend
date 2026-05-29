import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Filter } from 'lucide-react';
import { Tabela, type Coluna } from '@/interfaces-graficas/componentes/data/Tabela/Tabela';
import { MetricaResumo } from '@/interfaces-graficas/componentes/base/MetricaResumo';
import {
  BadgeStatusValor,
  Botao,
  Calendario,
  MenuFiltrosLateral,
  PainelFiltro,
  PainelFiltroAcoes,
  PainelFiltroCampo,
  PainelFiltroControles,
} from '@/interfaces-graficas/componentes';
import { Card } from '@/interfaces-graficas/componentes/layout/Card';
import { ObterResumoFinancasUseCase } from '@/application/financas/ObterResumoFinancasUseCase';
import { FinancasApiRepository } from '@/infrastructure/api/FinancasApiRepository';
import { FinancasResumo, FinancasPorStatus } from '@/domain/entidades/Financas';
import { formatarMoeda } from '@/interfaces-graficas/utils/formatarMoeda';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import styles from '@/interfaces-graficas/paginas/financas/Financas/Financas.module.css';

const obterResumoUseCase = new ObterResumoFinancasUseCase(new FinancasApiRepository());

function inicioMesAtual(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
}

function fimMesAtual(): string {
  const hoje = new Date();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
}

function periodoPadrao() {
  return { dataInicio: inicioMesAtual(), dataFim: fimMesAtual() };
}

const COLUNAS_STATUS: Coluna<FinancasPorStatus>[] = [
  { chave: 'quantidade', titulo: 'Quantidade' },
  {
    chave: 'valorTotal',
    titulo: 'Valor total',
    render: (item) => formatarMoeda(Number(item.valorTotal)),
  },
  {
    chave: 'status',
    titulo: 'Status',
    render: (item) => <BadgeStatusValor status={item.status} />,
  },
];

export function Financas() {
  const [filtros, setFiltros] = useState(periodoPadrao);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [resumo, setResumo] = useState<FinancasResumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(periodo = filtros) {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await obterResumoUseCase.executar(periodo.dataInicio, periodo.dataFim);
      setResumo(dados);
    } catch {
      setErro('Não foi possível carregar o resumo financeiro.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar(periodoPadrao());
  }, []);

  function buscarComFiltros() {
    setFiltrosAbertos(false);
    void carregar(filtros);
  }

  function limparFiltros() {
    const padrao = periodoPadrao();
    setFiltros(padrao);
    setFiltrosAbertos(false);
    void carregar(padrao);
  }

  return (
    <div className={styles.financas}>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>Finanças</h1>
          <p>Relatório agregado dos aluguéis no período</p>
        </div>
        <div className={paginaListagemStyles['pagina-listagem__acoes']}>
          <Botao tipo="secundario" onClick={() => setFiltrosAbertos(true)}>
            <Filter size={16} />
            Filtros
          </Botao>
        </div>
      </header>

      <MenuFiltrosLateral
        aberto={filtrosAbertos}
        onFechar={() => setFiltrosAbertos(false)}
        titulo="Filtro de período"
      >
        <PainelFiltro variante="lateral">
          <PainelFiltroControles>
            <PainelFiltroCampo>
              <Calendario
                id="dataInicio"
                label="Data início"
                value={filtros.dataInicio}
                onChange={(valor) => setFiltros((prev) => ({ ...prev, dataInicio: valor }))}
                permitirPassado
                required
                clearable={false}
              />
            </PainelFiltroCampo>
            <PainelFiltroCampo>
              <Calendario
                id="dataFim"
                label="Data fim"
                value={filtros.dataFim}
                onChange={(valor) => setFiltros((prev) => ({ ...prev, dataFim: valor }))}
                permitirPassado
                min={filtros.dataInicio}
                required
                clearable={false}
              />
            </PainelFiltroCampo>
          </PainelFiltroControles>
          <PainelFiltroAcoes
            onBuscar={buscarComFiltros}
            onLimpar={limparFiltros}
            carregando={carregando}
            textoBuscar="Buscar"
          />
        </PainelFiltro>
      </MenuFiltrosLateral>

      {erro && <Alert variant="danger">{erro}</Alert>}

      {carregando && <p className={styles.financas__mensagem}>Carregando...</p>}

      {resumo && !carregando && (
        <>
          <section className={styles.financas__metricas} aria-label="Indicadores">
            <MetricaResumo
              valor={formatarMoeda(Number(resumo.receitaBruta))}
              rotulo="Receita bruta"
            />
            <MetricaResumo
              valor={formatarMoeda(Number(resumo.totalDescontos))}
              rotulo="Descontos"
            />
            <MetricaResumo
              valor={formatarMoeda(Number(resumo.totalMultas))}
              rotulo="Multas"
            />
            <MetricaResumo
              valor={formatarMoeda(Number(resumo.receitaLiquida))}
              rotulo="Receita líquida"
            />
            <MetricaResumo valor={resumo.quantidadeAlugueis} rotulo="Aluguéis no período" />
          </section>

          <Card titulo="Resumo por status">
            <Tabela
              colunas={COLUNAS_STATUS}
              dados={resumo.porStatus}
              preencherLinhas={false}
            />
          </Card>
        </>
      )}
    </div>
  );
}
