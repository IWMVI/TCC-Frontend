import { ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from '@/interfaces-graficas/componentes/feedback/ModalFormulario/ModalFormulario.module.css';

interface ModalFormularioProps {
    titulo: string;
    estaAberto: boolean;
    aoFechar: () => void;
    children: ReactNode;
}

export function ModalFormulario({
    titulo,
    estaAberto,
    aoFechar,
    children,
}: Readonly<ModalFormularioProps>) {
    if (!estaAberto) {
        return null;
    }

    return (
        <div className={styles.modal__overlay}>
            <button
                type="button"
                className={styles.modal__backdrop}
                onClick={aoFechar}
                aria-label="Fechar modal"
            />
            <dialog className={styles.modal__container} open>
                <div className={styles.modal__header}>
                    <h2 className={styles.modal__titulo}>{titulo}</h2>
                    <button
                        type="button"
                        className={styles.modal__fechar}
                        onClick={aoFechar}
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.modal__body}>{children}</div>
            </dialog>
        </div>
    );
}
