import styles from './DetalhesAluguel.module.css';

interface Props {
  dataRetirada: string;
  dataDevolucao: string;
  desconto: number;
  subtotal: number;
  total: number;
  onDataRetiradaChange: (data: string) => void;
  onDataDevolucaoChange: (data: string) => void;
  onDescontoChange: (desconto: number) => void;
}

export function DetalhesAluguel({
  dataRetirada,
  dataDevolucao,
  desconto,
  subtotal,
  total,
  onDataRetiradaChange,
  onDataDevolucaoChange,
  onDescontoChange,
}: Props) {
  return (
    <div className={styles.detalhesAluguel}>
      <div className={styles.linha1}>
        <div className={styles.campo}>
          <label htmlFor="data-retirada">Data de Retirada</label>
          <input
            id="data-retirada"
            type="date"
            value={dataRetirada}
            onChange={(e) => onDataRetiradaChange(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="data-devolucao">Data de Devolução</label>
          <input
            id="data-devolucao"
            type="date"
            value={dataDevolucao}
            onChange={(e) => onDataDevolucaoChange(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="status">Status</label>
          <select id="status" className={styles.input} disabled>
            <option>ATIVO</option>
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="desconto">Desconto (R$)</label>
          <input
            id="desconto"
            type="number"
            min="0"
            step="0.01"
            value={desconto}
            onChange={(e) => onDescontoChange(parseFloat(e.target.value) || 0)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.linha2}>
        <div className={styles.resumo}>
          <div className={styles.linha}>
            <span className={styles.rotulo}>Subtotal:</span>
            <span className={styles.valor}>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className={styles.linha}>
            <span className={styles.rotulo}>Desconto:</span>
            <span className={styles.valor}>- R$ {desconto.toFixed(2)}</span>
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
