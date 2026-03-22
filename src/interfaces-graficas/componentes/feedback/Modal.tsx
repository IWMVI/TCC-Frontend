import './Modal.css';

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
    <div className="modal__overlay" onClick={aoCancelar}>
      <div className="modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__titulo">{titulo}</h2>
        </div>
        <div className="modal__body">
          <p className="modal__mensagem">{mensagem}</p>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="modal__botao modal__botao--secundario"
            onClick={aoCancelar}
          >
            {textoBotaoCancelar}
          </button>
          <button
            type="button"
            className={`modal__botao modal__botao--${tipoBotaoConfirmar}`}
            onClick={aoConfirmar}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
