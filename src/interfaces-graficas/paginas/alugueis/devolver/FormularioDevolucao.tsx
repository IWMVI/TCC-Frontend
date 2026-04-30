import { useState } from 'react';
import { AluguemApiRepository } from '../../../../infrastructure/api';
import { RegistrarDevolucaoUseCase } from '../../../../application/alugueis';
import { DevolucaoRequest } from '../../../../domain/entidades';
import styles from './FormularioDevolucao.module.css';

interface FormularioDevolucaoProps {
  aluguelId: number;
  onSucesso: () => void;
  onCancelar: () => void;
}

const aluguelRepositorio = new AluguemApiRepository();
const registrarDevolucaoUseCase = new RegistrarDevolucaoUseCase(aluguelRepositorio);

export function FormularioDevolucao({ aluguelId, onSucesso, onCancelar }: FormularioDevolucaoProps) {
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [valorMulta, setValorMulta] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [erroDataDevolucao, setErroDataDevolucao] = useState('');
  const [erroValorMulta, setErroValorMulta] = useState('');
  const [erroGeral, setErroGeral] = useState('');

  const [estaEnviando, setEstaEnviando] = useState(false);

  function validar(): boolean {
    let valido = true;

    setErroDataDevolucao('');
    setErroValorMulta('');
    setErroGeral('');

    if (!dataDevolucao.trim()) {
      setErroDataDevolucao('A data de devolução é obrigatória.');
      valido = false;
    }

    if (valorMulta !== '' && Number(valorMulta) < 0) {
      setErroValorMulta('O valor da multa não pode ser negativo.');
      valido = false;
    }

    return valido;
  }

  async function handleConfirmar() {
    if (!validar()) return;

    const dados: DevolucaoRequest = {
      dataDevolucao,
      ...(valorMulta !== '' && { valorMulta: Number(valorMulta) }),
      ...(observacoes.trim() !== '' && { observacoes: observacoes.trim() }),
    };

    setEstaEnviando(true);
    try {
      await registrarDevolucaoUseCase.executar(aluguelId, dados);
      onSucesso();
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : 'Erro ao registrar devolução. Tente novamente.';
      setErroGeral(mensagem);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-titulo']}>Registrar Devolução</h2>
          <p className={styles['modal-subtitulo']}>Aluguel #{aluguelId}</p>
        </div>

        <div className={styles['modal-corpo']}>
          {erroGeral && (
            <div className={styles['erro-geral']} role="alert">
              {erroGeral}
            </div>
          )}

          <div className={styles['campo-grupo']}>
            <label htmlFor="dataDevolucao" className={styles['campo-label']}>
              Data de Devolução <span className={styles['obrigatorio']}>*</span>
            </label>
            <input
              id="dataDevolucao"
              type="date"
              value={dataDevolucao}
              onChange={(e) => {
                setDataDevolucao(e.target.value);
                if (erroDataDevolucao) setErroDataDevolucao('');
              }}
              className={`${styles['campo-input']} ${erroDataDevolucao ? styles['campo-input--erro'] : ''}`}
              aria-describedby={erroDataDevolucao ? 'erro-dataDevolucao' : undefined}
              aria-required="true"
            />
            {erroDataDevolucao && (
              <span id="erro-dataDevolucao" className={styles['campo-erro']} role="alert">
                {erroDataDevolucao}
              </span>
            )}
          </div>

          <div className={styles['campo-grupo']}>
            <label htmlFor="valorMulta" className={styles['campo-label']}>
              Valor da Multa (R$)
            </label>
            <input
              id="valorMulta"
              type="number"
              min="0"
              step="0.01"
              value={valorMulta}
              onChange={(e) => {
                setValorMulta(e.target.value);
                if (erroValorMulta) setErroValorMulta('');
              }}
              className={`${styles['campo-input']} ${erroValorMulta ? styles['campo-input--erro'] : ''}`}
              placeholder="0,00"
              aria-describedby={erroValorMulta ? 'erro-valorMulta' : undefined}
            />
            {erroValorMulta && (
              <span id="erro-valorMulta" className={styles['campo-erro']} role="alert">
                {erroValorMulta}
              </span>
            )}
          </div>

          <div className={styles['campo-grupo']}>
            <label htmlFor="observacoes" className={styles['campo-label']}>
              Observações
            </label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={200}
              rows={4}
              className={styles['campo-textarea']}
              placeholder="Observações sobre a devolução (opcional)"
            />
            <span className={styles['campo-contador']}>
              {observacoes.length}/200
            </span>
          </div>
        </div>

        <div className={styles['modal-acoes']}>
          <button
            type="button"
            className={styles['botao-cancelar']}
            onClick={onCancelar}
            disabled={estaEnviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles['botao-confirmar']}
            onClick={handleConfirmar}
            disabled={estaEnviando}
          >
            {estaEnviando ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
