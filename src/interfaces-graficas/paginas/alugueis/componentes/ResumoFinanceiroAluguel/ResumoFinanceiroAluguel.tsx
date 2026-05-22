import styles from '@/interfaces-graficas/paginas/alugueis/componentes/ResumoFinanceiroAluguel/ResumoFinanceiroAluguel.module.css';
import { ResumoFinanceiro } from '@/interfaces-graficas/paginas/alugueis/utils/resumoFinanceiro';

interface Props {
  resumo: ResumoFinanceiro;
  titulo?: string;
  variante?: 'padrao' | 'modal';
}

export function ResumoFinanceiroAluguel({
  resumo,
  titulo = 'Resumo Financeiro',
  variante = 'padrao',
}: Readonly<Props>) {
  const classeContainer =
    variante === 'modal' ? styles.resumoModal : styles.resumoPadrao;

  return (
    <section className={classeContainer}>
      {titulo && <h3 className={styles.titulo}>{titulo}</h3>}
      <div className={styles.corpo}>
        <div className={styles.linha}>
          <span>Subtotal</span>
          <span>R$ {resumo.subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.linha}>
          <span>Desconto</span>
          <span className={styles.desconto}>- R$ {resumo.desconto.toFixed(2)}</span>
        </div>
        {resumo.multa > 0 && (
          <div className={styles.linha}>
            <span>Multa</span>
            <span className={styles.multa}>+ R$ {resumo.multa.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.total}>
          <span>Total</span>
          <span>R$ {resumo.total.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}
