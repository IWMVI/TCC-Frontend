import styles from '@/interfaces-graficas/componentes/layout/Card/Card.module.css';

interface CardProps {
  titulo?: string;
  children: React.ReactNode;
  className?: string;
  preencheAltura?: boolean;
  icone?: React.ReactNode;
}

export function Card({
  titulo,
  children,
  className = '',
  preencheAltura = false,
  icone,
}: CardProps) {
  const exibirCabecalho = Boolean(titulo) && !preencheAltura;

  return (
    <div
      className={`${styles.card} ${preencheAltura ? styles['card--listagem'] : ''} ${className}`.trim()}
    >
      {exibirCabecalho && (
        <div className={styles.card__header}>
          {icone && (
            <span className={styles.card__icone} aria-hidden="true">
              {icone}
            </span>
          )}
          <h2 className={styles.card__titulo}>{titulo}</h2>
        </div>
      )}
      <div className={styles.card__conteudo}>
        <div className={styles.card__corpo}>{children}</div>
      </div>
    </div>
  );
}
