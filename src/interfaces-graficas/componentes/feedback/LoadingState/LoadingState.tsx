import styles from './LoadingState.module.css';

interface LoadingStateProps {
  mensagem?: string;
  tamanho?: 'pequeno' | 'medio' | 'grande';
}

export function LoadingState({
  mensagem = 'Carregando...',
  tamanho = 'medio',
}: LoadingStateProps) {
  return (
    <div className={`${styles.loading} ${styles[`loading--${tamanho}`]}`}>
      <div className={styles.loading__spinner} />
      <span className={styles.loading__mensagem}>{mensagem}</span>
    </div>
  );
}
