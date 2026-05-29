import { Link } from 'react-router-dom';
import styles from '@/interfaces-graficas/componentes/base/MetricaResumo/MetricaResumo.module.css';

interface MetricaResumoProps {
  valor: string | number;
  rotulo: string;
  icone?: React.ReactNode;
  rota?: string;
}

export function MetricaResumo({ valor, rotulo, icone, rota }: Readonly<MetricaResumoProps>) {
  const conteudo = (
    <>
      {icone && (
        <div className={styles.metrica__icone} aria-hidden="true">
          {icone}
        </div>
      )}
      <span className={styles.metrica__valor}>{valor}</span>
      <span className={styles.metrica__rotulo}>{rotulo}</span>
    </>
  );

  if (rota) {
    return (
      <Link to={rota} className={styles.metrica} aria-label={`Ver detalhes: ${rotulo}`}>
        {conteudo}
      </Link>
    );
  }

  return <article className={styles.metrica}>{conteudo}</article>;
}
