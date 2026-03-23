import styles from './Modal.module.css';

interface ModalProps {
  titulo: string;
  mensagem: string;
  estaAberto: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  tipoBotaoConfirmar?: 'primario' | 'perigo';
}

export function Modal({
  titulo,
  mensagem,
  estaAberto,
  aoConfirmar,
  aoCancelar,
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  tipoBotaoConfirmar = 'perigo',
}: ModalProps) {
  if (!estaAberto) {
    return null;
  }

  return (
    <div className={styles.modal__overlay} onClick={aoCancelar}>
      <div className={styles.modal__container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal__header}>
          <h2 className={styles.modal__titulo}>{titulo}</h2>
        </div>
        <div className={styles.modal__body}>
          <p className={styles.modal__mensagem}>{mensagem}</p>
        </div>
        <div className={styles.modal__footer}>
          <button
            type="button"
            className={`${styles['modal__botao']} ${styles['modal__botao--secundario']}`}
            onClick={aoCancelar}
          >
            {textoBotaoCancelar}
          </button>
          <button
            type="button"
            className={`${styles['modal__botao']} ${styles[`modal__botao--${tipoBotaoConfirmar}`]}`}
            onClick={aoConfirmar}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
