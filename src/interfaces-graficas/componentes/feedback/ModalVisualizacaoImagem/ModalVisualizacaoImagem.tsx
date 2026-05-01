import { useState, useRef } from 'react';
import styles from '@/interfaces-graficas/componentes/feedback/ModalVisualizacaoImagem/ModalVisualizacaoImagem.module.css';
import { Modal } from '@/interfaces-graficas/componentes/feedback/Modal/Modal';
import { X, Upload, Trash2 } from 'lucide-react';

interface ModalVisualizacaoImagemProps {
  imagemUrl: string | null | undefined;
  trajeId: number;
  trajeNome: string;
  estaAberto: boolean;
  aoFechar: () => void;
  aoAtualizarImagem: (trajeId: number, file: File) => Promise<void>;
  aoRemoverImagem: (trajeId: number) => Promise<void>;
}

export function ModalVisualizacaoImagem({
  imagemUrl,
  trajeId,
  trajeNome,
  estaAberto,
  aoFechar,
  aoAtualizarImagem,
  aoRemoverImagem,
}: ModalVisualizacaoImagemProps) {
  const [arquivoPendente, setArquivoPendente] = useState<File | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [tipoConfirmacao, setTipoConfirmacao] = useState<'alteracao' | 'remocao' | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagemUrl) {
      setArquivoPendente(file);
      setMostrarConfirmacao(true);
    } else {
      setConfirmando(true);
      try {
        await aoAtualizarImagem(trajeId, file);
      } finally {
        setConfirmando(false);
        if (inputFileRef.current) {
          inputFileRef.current.value = '';
        }
      }
    }
  };

  const handleCancelarConfirmacao = () => {
    setArquivoPendente(null);
    setMostrarConfirmacao(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleConfirmarAlteracao = async () => {
    setConfirmando(true);
    try {
      if (tipoConfirmacao === 'remocao') {
        await aoRemoverImagem(trajeId);
      } else if (arquivoPendente) {
        await aoAtualizarImagem(trajeId, arquivoPendente);
      }
      setArquivoPendente(null);
      setMostrarConfirmacao(false);
      setTipoConfirmacao(null);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    } finally {
      setConfirmando(false);
    }
  };

  const handleRemover = () => {
    setArquivoPendente(null);
    setTipoConfirmacao('remocao');
    setMostrarConfirmacao(true);
  };

  if (!estaAberto) return null;

  return (
    <>
      <div className={styles.modal__overlay} onClick={aoFechar}>
        <div className={styles.modal__container} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modal__header}>
            <h2 className={styles.modal__titulo}>Imagem do Traje</h2>
            <span className={styles.modal__nome}>{trajeNome}</span>
            <button
              type="button"
              className={styles.modal__fechar}
              onClick={aoFechar}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.modal__body}>
            <div className={styles.modal__imagemContainer}>
              {imagemUrl ? (
                <img
                  src={imagemUrl}
                  alt={`Imagem do traje ${trajeNome}`}
                  className={styles.modal__imagem}
                />
              ) : (
                <div className={styles.modal__semImagem}>
                  <p>Sem imagem cadastrada</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.modal__footer}>
            <label className={styles.modal__botaoUpload}>
              <Upload size={18} />
              <span>{imagemUrl ? 'Trocar Imagem' : 'Adicionar Imagem'}</span>
              <input
                ref={inputFileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.modal__inputFile}
              />
            </label>

            {imagemUrl && (
              <button
                type="button"
                className={styles.modal__botaoRemover}
                onClick={handleRemover}
                title="Remover imagem"
              >
                <Trash2 size={18} />
                <span>Remover</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        titulo={tipoConfirmacao === 'remocao' ? 'Confirmar Remoção' : 'Confirmar Alteração'}
        mensagem={
          tipoConfirmacao === 'remocao'
            ? `Tem certeza que deseja remover a imagem do traje "${trajeNome}"?`
            : `Tem certeza que deseja trocar a imagem do traje "${trajeNome}"?`
        }
        estaAberto={mostrarConfirmacao}
        aoConfirmar={handleConfirmarAlteracao}
        aoCancelar={handleCancelarConfirmacao}
        textoBotaoConfirmar={confirmando ? 'Confirmando...' : 'Confirmar'}
        textoBotaoCancelar="Cancelar"
        tipoBotaoConfirmar={tipoConfirmacao === 'remocao' ? 'perigo' : 'primario'}
      />
    </>
  );
}
