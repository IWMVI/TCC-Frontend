import {TipoOcasiao} from '../../../../../domain/entidades';
import {Calendario} from '../../../../componentes';
import {obterAliasTipoOcasiao} from '../../utils/ocasiao';
import styles from './DetalhesAluguel.module.css';

interface Props {
  dataRetirada: string;
  dataDevolucao: string;
  observacoes: string;
  ocasiao: TipoOcasiao | '';
  valorDesconto: string;
  subtotal: number;
  total: number;
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
  onDataRetiradaChange,
  onDataDevolucaoChange,
                                  onObservacoesChange,
                                  onOcasiaoChange,
                                  onValorDescontoChange,
}: Props) {
  const descontoNumerico =
      Number.parseFloat(valorDesconto.replace(/\./g, '').replace(',', '.')) || 0;

  return (
    <div className={styles.detalhesAluguel}>
      <div className={styles.linha1}>
        <Calendario
            id="data-retirada"
            label="Data de Retirada"
            value={dataRetirada}
            onChange={onDataRetiradaChange}
            required
        />
        
        <Calendario
            id="data-devolucao"
            label="Data de Devolução"
            value={dataDevolucao}
            onChange={onDataDevolucaoChange}
            required
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
      </div>
      
      <div className={styles.linha2}>
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
      
      <div className={styles.linha3}>
        <div className={styles.resumo}>
          <div className={styles.linha}>
            <span className={styles.rotulo}>Subtotal:</span>
            <span className={styles.valor}>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className={styles.linha}>
            <span className={styles.rotulo}>Valor Desconto:</span>
            <span className={styles.valor}>- R$ {descontoNumerico.toFixed(2)}</span>
          </div>

          <div className={styles.linhaNegrito}>
            <span className={styles.rotulo}>Valor Total:</span>
            <span className={styles.valorTotal}>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}