import { PeriodoAlugado, TipoOcasiao } from '@domain/entidades';
import { Calendario } from '@/interfaces-graficas/componentes';
import { converterMoedaBrParaNumero } from '@/interfaces-graficas/utils/formatacoes';
import { obterAliasTipoOcasiao } from '@/interfaces-graficas/paginas/alugueis/utils/ocasiao';
import {
  dataDevolucaoComConflitoReserva,
  dataRetiradaIndisponivel,
  diaSeguinte,
} from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';
import styles from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/DetalhesAluguel.module.css';

interface Props {
  dataRetirada: string;
  dataDevolucao: string;
  observacoes: string;
  ocasiao: TipoOcasiao | '';
  valorDesconto: string;
  subtotal: number;
  total: number;
  periodosOcupados?: PeriodoAlugado[];
  carregandoPeriodos?: boolean;
  onDataRetiradaChange: (data: string) => void;
  onDataDevolucaoChange: (data: string) => void;
  onObservacoesChange: (valor: string) => void;
  onOcasiaoChange: (ocasiao: TipoOcasiao) => void;
  onValorDescontoChange: (valor: string) => void;
}

export function DetalhesAluguel({
  dataRetirada,
  dataDevolucao,
  observacoes,
  ocasiao,
  valorDesconto,
  subtotal,
  total,
  periodosOcupados = [],
  carregandoPeriodos = false,
  onDataRetiradaChange,
  onDataDevolucaoChange,
  onObservacoesChange,
  onOcasiaoChange,
  onValorDescontoChange,
}: Readonly<Props>) {
  const descontoNumerico = converterMoedaBrParaNumero(valorDesconto);
  const minDataDevolucao = dataRetirada ? diaSeguinte(dataRetirada) : undefined;
  const possuiTrajesComReservas = periodosOcupados.length > 0;

  return (
    <div className={styles.detalhesAluguel}>
      <div className={styles.conteudo}>
        <div className={styles.campos}>
          {possuiTrajesComReservas && (
            <p className={styles.avisoReservas} role="status">
              Datas em vermelho no calendário já estão reservadas para um ou mais trajes
              selecionados.
            </p>
          )}
          {carregandoPeriodos && (
            <p className={styles.avisoReservas} role="status">
              Carregando disponibilidade dos trajes…
            </p>
          )}

          <div className={styles.linhacampos}>
            <Calendario
              id="data-retirada"
              label="Data de Retirada"
              value={dataRetirada}
              onChange={onDataRetiradaChange}
              required
              verificarDataReservada={(data) =>
                dataRetiradaIndisponivel(data, periodosOcupados)
              }
              verificarDataDesabilitada={(data) =>
                dataRetiradaIndisponivel(data, periodosOcupados)
              }
            />

            <Calendario
              id="data-devolucao"
              label="Data de Devolução"
              value={dataDevolucao}
              onChange={onDataDevolucaoChange}
              required
              min={minDataDevolucao}
              disabled={!dataRetirada}
              verificarDataReservada={(data) => {
                if (!dataRetirada || data <= dataRetirada) {
                  return false;
                }
                return dataDevolucaoComConflitoReserva(
                  dataRetirada,
                  data,
                  periodosOcupados,
                );
              }}
              verificarDataDesabilitada={(data) => {
                if (!dataRetirada || data <= dataRetirada) {
                  return false;
                }
                return dataDevolucaoComConflitoReserva(
                  dataRetirada,
                  data,
                  periodosOcupados,
                );
              }}
            />

            <div className={styles.campo}>
              <label htmlFor="ocasiao">Ocasião</label>
              <select
                id="ocasiao"
                value={ocasiao}
                onChange={(e) => onOcasiaoChange(e.target.value as TipoOcasiao)}
                className={styles.input}
              >
                <option value="">Selecione</option>
                {Object.values(TipoOcasiao).map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {obterAliasTipoOcasiao(tipo)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.campo}>
              <label htmlFor="valor-desconto">Valor Desconto (R$)</label>
              <input
                id="valor-desconto"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={valorDesconto}
                onChange={(e) => onValorDescontoChange(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.campo}>
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => onObservacoesChange(e.target.value)}
              maxLength={200}
              className={styles.textarea}
              placeholder="Observações do aluguel"
            />
          </div>
        </div>

        <div className={styles.resumo}>
          <div className={styles.linhaResumo}>
            <span className={styles.rotulo}>Subtotal:</span>
            <span className={styles.valor}>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className={styles.linhaResumo}>
            <span className={styles.rotulo}>Desconto:</span>
            <span className={styles.valor}>- R$ {descontoNumerico.toFixed(2)}</span>
          </div>

          <div className={styles.linhaNegrito}>
            <span className={styles.rotulo}>Total:</span>
            <span className={styles.valorTotal}>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
