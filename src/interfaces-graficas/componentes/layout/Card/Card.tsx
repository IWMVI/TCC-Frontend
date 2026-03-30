import styles from './Card.module.css';

interface CardProps {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ titulo, children, className = '' }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.card__header}>
        <h2 className={styles.card__titulo}>{titulo}</h2>
      </div>
      <div className={styles.card__conteudo}>
        <div className={styles.card__corpo}>{children}</div>
      </div>
    </div>
  );
}
