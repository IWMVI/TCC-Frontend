import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { BadgeStatusValor, Paginacao } from '@/interfaces-graficas/componentes';
import { Tabela, type Coluna } from '@/interfaces-graficas/componentes/data/Tabela/Tabela';
import { Card } from '@/interfaces-graficas/componentes/layout/Card';
import { MetricaResumo } from '@/interfaces-graficas/componentes/base/MetricaResumo';
import { ListarAlugueisMetricaDashboardUseCase } from '@/application/dashboard/ListarAlugueisMetricaDashboardUseCase';
import { DashboardApiRepository } from '@/infrastructure/api/DashboardApiRepository';
import { AluguelResponse } from '@/domain/entidades';
import {
  calcularTotalPaginas,
  paginarLista,
  TAMANHO_PAGINA_PADRAO,
} from '@domain/constants/paginacao';
import {
  obterConfigMetrica,
  tipoMetricaValido,
  type TipoMetricaDashboard,
} from '@/domain/entidades/MetricaDashboard';
import { formatarDataBr } from '@/interfaces-graficas/utils/formatarData';
import { formatarMoeda } from '@/interfaces-graficas/utils/formatarMoeda';
import paginaListagemStyles from '@/interfaces-graficas/estilos/PaginaListagem.module.css';
import styles from '@/interfaces-graficas/paginas/dashboard/DetalheMetrica/DetalheMetrica.module.css';

const listarAlugueisMetricaUseCase = new ListarAlugueisMetricaDashboardUseCase(
  new DashboardApiRepository(),
);

function colunasBase(tipo: TipoMetricaDashboard): Coluna<AluguelResponse>[] {
  const colunas: Coluna<AluguelResponse>[] = [
    { chave: 'nomeCliente', titulo: 'Cliente' },
    {
      chave: 'dataAluguel',
      titulo: 'Data do aluguel',
      render: (item) => formatarDataBr(item.dataAluguel),
    },
    {
      chave: 'dataDevolucao',
      titulo: 'Devolução',
      render: (item) => formatarDataBr(item.dataDevolucao),
    },
  ];

  if (tipo === 'multas') {
    colunas.push({
      chave: 'valorMulta',
      titulo: 'Multa',
      render: (item) => formatarMoeda(Number(item.valorMulta)),
    });
  }

  if (tipo === 'descontos') {
    colunas.push({
      chave: 'valorDesconto',
      titulo: 'Desconto',
      render: (item) => formatarMoeda(Number(item.valorDesconto)),
    });
  }

  colunas.push({
    chave: 'valorTotal',
    titulo: 'Valor total',
    render: (item) => formatarMoeda(Number(item.valorTotal)),
  });

  colunas.push({
    chave: 'status',
    titulo: 'Status',
    render: (item) => <BadgeStatusValor status={item.status} />,
  });

  return colunas;
}

export function DetalheMetrica() {
  const { tipo } = useParams<{ tipo: string }>();
  const [alugueis, setAlugueis] = useState<AluguelResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const config = tipo && tipoMetricaValido(tipo) ? obterConfigMetrica(tipo) : undefined;

  const colunas = useMemo(
    () => (config ? colunasBase(config.tipo) : []),
    [config],
  );

  const totalValor = useMemo(
    () => alugueis.reduce((soma, item) => soma + Number(item.valorTotal), 0),
    [alugueis],
  );

  const alugueisPaginados = useMemo(
    () => paginarLista(alugueis, paginaAtual, TAMANHO_PAGINA_PADRAO),
    [alugueis, paginaAtual],
  );

  const totalPaginas = useMemo(
    () => calcularTotalPaginas(alugueis.length, TAMANHO_PAGINA_PADRAO),
    [alugueis.length],
  );

  useEffect(() => {
    if (!tipo || !tipoMetricaValido(tipo)) {
      return;
    }

    const tipoMetrica = tipo;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      setPaginaAtual(0);
      try {
        const dados = await listarAlugueisMetricaUseCase.executar(tipoMetrica);
        setAlugueis(dados);
      } catch {
        setErro('Não foi possível carregar os aluguéis desta métrica.');
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [tipo]);

  if (!tipo || !tipoMetricaValido(tipo) || !config) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={paginaListagemStyles['pagina-listagem']} data-pagina-listagem>
      <header className={paginaListagemStyles['pagina-listagem__header']}>
        <div className={paginaListagemStyles['pagina-listagem__titulo']}>
          <h1>{config.titulo}</h1>
          <p>{config.descricao}</p>
        </div>
      </header>

      {erro && <Alert variant="danger">{erro}</Alert>}

      <section className={styles.detalhe__resumo} aria-label="Indicadores">
        <div className={styles.detalhe__metricas}>
          <MetricaResumo valor={alugueis.length} rotulo="Registros" />
          <MetricaResumo valor={formatarMoeda(totalValor)} rotulo="Soma dos valores" />
        </div>
      </section>

      <Card preencheAltura>
        <div className={paginaListagemStyles['pagina-listagem__area-card']}>
          <div className={paginaListagemStyles['pagina-listagem__tabela']}>
            <Tabela
              colunas={colunas}
              dados={alugueisPaginados}
              estaCarregando={carregando}
              linhasPorPagina={TAMANHO_PAGINA_PADRAO}
            />
          </div>

          <div className={paginaListagemStyles['pagina-listagem__paginacao']}>
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              totalRegistros={alugueis.length}
              tamanhoPagina={TAMANHO_PAGINA_PADRAO}
              onPageChange={setPaginaAtual}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
