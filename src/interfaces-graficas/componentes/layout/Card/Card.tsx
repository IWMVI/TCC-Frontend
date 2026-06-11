import styles from '@/interfaces-graficas/componentes/layout/Card/Card.module.css';

interface CardProps {
  titulo?: string;
  children: React.ReactNode;
  className?: string;
  preencheAltura?: boolean;
}

export function Card({ titulo, children, className = '', preencheAltura }: CardProps) {
  return (
    <div className={`${styles.card} ${preencheAltura ? styles['card--altura-toda'] : ''} ${className}`}>
      {titulo && (
        <div className={styles.card__header}>
          <h2 className={styles.card__titulo}>{titulo}</h2>
        </div>
      )}
      <div className={styles.card__conteudo}>
        <div className={styles.card__corpo}>{children}</div>
      </div>
    </div>
  );
}
