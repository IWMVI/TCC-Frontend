import { formatarMesAnoCurto } from '@/interfaces-graficas/utils/formatarMesAno';
import {
  corBarraGraficoMensal,
  corTextoGraficoMensal,
  type PaletaGraficoDashboard,
  type TomGraficoDashboard,
} from '@/interfaces-graficas/utils/coresGrafico';
import {
  calcularEscalaGrafico,
  calcularEscalaGraficoInteira,
  calcularEscalaGraficoMonetario,
} from '@/interfaces-graficas/utils/escalaGrafico';
import { useLarguraElemento } from '@/interfaces-graficas/hooks/useLarguraElemento';
import styles from '@/interfaces-graficas/componentes/dashboard/GraficoBarrasMensal/GraficoBarrasMensal.module.css';

export interface PontoGraficoMensal {
  mes: string;
  valor: number;
}

export type EscalaGraficoBarras = 'automatica' | 'inteira' | 'monetaria';

interface GraficoBarrasMensalProps {
  dados: PontoGraficoMensal[];
  formatarValor: (valor: number) => string;
  formatarEixo?: (valor: number) => string;
  paleta?: PaletaGraficoDashboard;
  tom?: TomGraficoDashboard;
  escala?: EscalaGraficoBarras;
  valorVazio?: string;
}

function resolverEscala(valorMaximoDados: number, escala: EscalaGraficoBarras) {
  if (escala === 'inteira') {
    return calcularEscalaGraficoInteira(valorMaximoDados);
  }

  if (escala === 'monetaria') {
    return calcularEscalaGraficoMonetario(valorMaximoDados);
  }

  return calcularEscalaGrafico(valorMaximoDados);
}

const ALTURA_AREA_BARRAS = 168;
const ALTURA_RESERVA_ROTULO = 18;
const ALTURA_UTIL_BARRAS = ALTURA_AREA_BARRAS - ALTURA_RESERVA_ROTULO;
const LARGURA_MINIMA_COLUNA = 44;
const LARGURA_EIXO_Y = 56;
const ALTURA_MINIMA_BARRA = 6;

function calcularAlturaBarraPx(valor: number, valorMaximo: number): number {
  if (valor <= 0 || valorMaximo <= 0) {
    return 0;
  }

  const proporcao = valor / valorMaximo;
  return Math.max(Math.round(proporcao * ALTURA_UTIL_BARRAS), ALTURA_MINIMA_BARRA);
}

export function GraficoBarrasMensal({
  dados,
  formatarValor,
  formatarEixo,
  paleta = 'info',
  tom = 'vivido',
  escala = 'automatica',
  valorVazio = 'Sem dados no período',
}: Readonly<GraficoBarrasMensalProps>) {
  const sobrio = tom === 'sobrio';
  const { ref: scrollRef, largura: larguraScroll } = useLarguraElemento<HTMLDivElement>();

  if (dados.length === 0) {
    return <p className={styles.grafico__vazio}>{valorVazio}</p>;
  }

  const formatarEixoY = formatarEixo ?? formatarValor;
  const valorMaximoDados = Math.max(...dados.map((ponto) => ponto.valor), 0);
  const { maximo: valorMaximoEixo, marcas: marcasEixo } = resolverEscala(valorMaximoDados, escala);
  const larguraDisponivelColunas = Math.max(0, larguraScroll - LARGURA_EIXO_Y);
  const distribuiColunas =
    dados.length === 0 ||
    larguraScroll === 0 ||
    larguraDisponivelColunas >= dados.length * LARGURA_MINIMA_COLUNA;
  const larguraPlotMinima = dados.length * LARGURA_MINIMA_COLUNA;
  const totalPontos = dados.length;

  return (
    <div
      className={`${styles.grafico} ${sobrio ? styles['grafico--sobrio'] : ''}`.trim()}
      role="img"
      aria-label="Gráfico de barras mensal"
    >
      <div className={styles.grafico__corpo}>
        <div className={styles.grafico__eixo_y} style={{ height: ALTURA_AREA_BARRAS }}>
          {marcasEixo.map((marca) => (
            <span key={marca} className={styles.grafico__marca_eixo}>
              {marca === 0 ? '0' : formatarEixoY(marca) || String(marca)}
            </span>
          ))}
        </div>

        <div ref={scrollRef} className={styles.grafico__scroll}>
          <div
            className={`${styles.grafico__plot} ${distribuiColunas ? styles['grafico__plot--flex'] : ''}`.trim()}
            style={!distribuiColunas ? { minWidth: larguraPlotMinima } : undefined}
          >
            <div
              className={styles.grafico__grade}
              style={{ height: ALTURA_AREA_BARRAS }}
              aria-hidden="true"
            >
              {marcasEixo.map((marca) => (
                <span key={`linha-${marca}`} className={styles.grafico__linha_grade} />
              ))}
            </div>

            <div
              className={`${styles.grafico__colunas} ${distribuiColunas ? styles['grafico__colunas--flex'] : ''}`.trim()}
              style={{ height: ALTURA_AREA_BARRAS }}
            >
              {dados.map((ponto, indice) => {
                const possuiValor = ponto.valor > 0;
                const alturaBarraPx = calcularAlturaBarraPx(ponto.valor, valorMaximoEixo);
                const rotuloMes = formatarMesAnoCurto(ponto.mes);
                const valorFormatado = formatarValor(ponto.valor);
                const exibeRotuloValor = possuiValor && valorFormatado.length > 0;
                const ehUltimo = indice === totalPontos - 1;
                const corBarra = !sobrio && possuiValor
                  ? corBarraGraficoMensal(paleta, indice, totalPontos, ehUltimo, tom)
                  : undefined;
                const corTexto =
                  !sobrio && possuiValor
                    ? corTextoGraficoMensal(paleta, indice, totalPontos, tom)
                    : undefined;
                const classesBarra = [
                  styles.grafico__barra,
                  sobrio ? styles['grafico__barra--sobria'] : '',
                  sobrio && ehUltimo ? styles['grafico__barra--sobria-atual'] : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={ponto.mes}
                    className={[
                      styles.grafico__coluna,
                      indice % 2 === 0 ? styles['grafico__coluna--faixa'] : '',
                      ehUltimo ? styles['grafico__coluna--atual'] : '',
                      possuiValor
                        ? styles['grafico__coluna--com_valor']
                        : styles['grafico__coluna--sem_valor'],
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div
                      className={styles.grafico__trilho}
                      style={{ height: ALTURA_AREA_BARRAS }}
                    >
                      {possuiValor ? (
                        <div className={styles.grafico__pilha}>
                          {exibeRotuloValor && (
                            <span
                              className={styles.grafico__valor}
                              style={corTexto ? { color: corTexto } : undefined}
                              title={`${rotuloMes}: ${valorFormatado}`}
                            >
                              {valorFormatado}
                            </span>
                          )}
                          <div
                            className={classesBarra}
                            style={{
                              height: alturaBarraPx,
                              ...(corBarra
                                ? {
                                    backgroundColor: corBarra,
                                    boxShadow: ehUltimo
                                      ? `0 3px 10px color-mix(in srgb, ${corBarra} 45%, transparent)`
                                      : `0 2px 5px color-mix(in srgb, ${corBarra} 30%, transparent)`,
                                  }
                                : undefined),
                            }}
                            title={`${rotuloMes}: ${valorFormatado}`}
                          />
                        </div>
                      ) : (
                        <div
                          className={styles.grafico__barra_sem_dado}
                          title={`${rotuloMes}: sem movimentação`}
                          aria-label={`${rotuloMes}: sem dados`}
                        />
                      )}
                    </div>

                    <span
                      className={styles.grafico__mes}
                      style={corTexto ? { color: corTexto } : undefined}
                    >
                      {rotuloMes}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grafico__legenda} aria-hidden="true">
        <span className={styles.grafico__legenda_item}>
          <span
            className={`${styles.grafico__legenda_amostra} ${styles['grafico__legenda_amostra--com_dado']}`}
          />
          Com valor
        </span>
        <span className={styles.grafico__legenda_item}>
          <span
            className={`${styles.grafico__legenda_amostra} ${styles['grafico__legenda_amostra--sem_dado']}`}
          />
          Sem movimentação
        </span>
      </div>
    </div>
  );
}
