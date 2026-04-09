import { AlertCircle } from 'lucide-react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  mensagem: string;
  tipo?: 'erro' | 'aviso' | 'sucesso';
  onDismiss?: () => void;
}

export function ErrorMessage({
  mensagem,
  tipo = 'erro',
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div className={`${styles['mensagem']} ${styles[`mensagem--${tipo}`]}`}>
      <AlertCircle size={18} className={styles['mensagem__icone']} />
      <span className={styles['mensagem__texto']}>{mensagem}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles['mensagem__botao-fechar']}
          onClick={onDismiss}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
}
