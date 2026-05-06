import {Calendario} from '@/interfaces-graficas/componentes';
import styles from '@/interfaces-graficas/paginas/alugueis/devolver/FormularioDevolucao.module.css';
import {converterMoedaBrParaNumero, formatarMoedaBrPartindoDeDigitos} from '@/interfaces-graficas/utils/formatacoes';
import {RegistrarDevolucaoUseCase} from '@application/alugueis';
import {CondicaoTraje, DevolucaoRequest, ItemDevolucaoRequest} from '@domain/entidades';
import {AluguelItem} from '@domain/entidades/Aluguel';
import {AluguelApiRepository} from '@infrastructure/api';
import {useState} from 'react';

interface FormularioDevolucaoProps {
  aluguelId: number;
  itens: AluguelItem[];
  onSucesso: () => void;
  onCancelar: () => void;
}

const aluguelRepositorio = new AluguelApiRepository();
const registrarDevolucaoUseCase = new RegistrarDevolucaoUseCase(aluguelRepositorio);

const OPCOES_CONDICAO: { valor: CondicaoTraje; rotulo: string }[] = [
  { valor: CondicaoTraje.NOVO,          rotulo: 'Novo' },
  { valor: CondicaoTraje.SEMINOVO,      rotulo: 'Seminovo' },
  { valor: CondicaoTraje.BOM,           rotulo: 'Bom' },
  { valor: CondicaoTraje.USADO,         rotulo: 'Usado' },
  { valor: CondicaoTraje.AVARIADO,      rotulo: 'Avariado' },
  { valor: CondicaoTraje.EM_MANUTENCAO, rotulo: 'Em Manutenção' },
  { valor: CondicaoTraje.HIGIENIZACAO,  rotulo: 'Higienização' },
];

export function FormularioDevolucao({ aluguelId, itens, onSucesso, onCancelar }: FormularioDevolucaoProps) {
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [valorMulta, setValorMulta] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Condição por traje: mapa trajeId -> CondicaoTraje
  const [condicoes, setCondicoes] = useState<Record<number, CondicaoTraje>>(() =>
    Object.fromEntries(itens.map((item) => [item.trajeId, CondicaoTraje.BOM])),
  );

  const [erroDataDevolucao, setErroDataDevolucao] = useState('');
  const [erroValorMulta, setErroValorMulta] = useState('');
  const [erroCondicoes, setErroCondicoes] = useState('');
  const [erroGeral, setErroGeral] = useState('');

  const [estaEnviando, setEstaEnviando] = useState(false);

  function atualizarCondicao(trajeId: number, condicao: CondicaoTraje) {
    setCondicoes((prev) => ({ ...prev, [trajeId]: condicao }));
    if (erroCondicoes) setErroCondicoes('');
  }

  function validar(): boolean {
    let valido = true;

    setErroDataDevolucao('');
    setErroValorMulta('');
    setErroCondicoes('');
    setErroGeral('');

    if (!dataDevolucao.trim()) {
      setErroDataDevolucao('A data de devolução é obrigatória.');
      valido = false;
    }

    if (valorMulta !== '' && converterMoedaBrParaNumero(valorMulta) < 0) {
      setErroValorMulta('O valor da multa não pode ser negativo.');
      valido = false;
    }

    const itensComCondicaoFaltando = itens.filter((item) => !condicoes[item.trajeId]);
    if (itensComCondicaoFaltando.length > 0) {
      setErroCondicoes('Informe a condição de todos os trajes.');
      valido = false;
    }

    return valido;
  }

  async function handleConfirmar() {
    if (!validar()) return;

    const itensDevolucao: ItemDevolucaoRequest[] = itens.map((item) => ({
      trajeId: item.trajeId,
      condicao: condicoes[item.trajeId],
    }));

    const dados: DevolucaoRequest = {
      dataDevolucao,
      itens: itensDevolucao,
      ...(valorMulta !== '' && { valorMulta: converterMoedaBrParaNumero(valorMulta) }),
      ...(observacoes.trim() !== '' && { observacoes: observacoes.trim() }),
    };

    setEstaEnviando(true);
    try {
      await registrarDevolucaoUseCase.executar(aluguelId, dados);
      onSucesso();
	} catch {
		setErroGeral('Não foi possível registrar a devolução. Tente novamente ou entre em contato com o suporte.');
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
            <Calendario
              id="dataDevolucao"
              label="Data de Devolução"
              value={dataDevolucao}
              onChange={(data) => {
                setDataDevolucao(data);
                if (erroDataDevolucao) setErroDataDevolucao('');
              }}
              required
              permitirPassado
            />
            {erroDataDevolucao && (
              <span id="erro-dataDevolucao" className={styles['campo-erro']} role="alert">
                {erroDataDevolucao}
              </span>
            )}
          </div>

          {/* Condição por traje */}
          {itens.length > 0 && (
            <div className={styles['campo-grupo']}>
              <span className={styles['campo-label']}>
                Condição dos Trajes <span className={styles['obrigatorio']} aria-hidden="true">*</span>
              </span>
              <ul className={styles['trajes-lista']}>
                {itens.map((item) => (
                  <li key={item.trajeId} className={styles['traje-item']}>
                    <div className={styles['traje-item__info']}>
                      <span className={styles['traje-item__id']}>#{item.trajeId}</span>
                      <span className={styles['traje-item__nome']}>{item.nomeTraje}</span>
                    </div>
                    <select
                      id={`condicao-${item.trajeId}`}
                      aria-label={`Condição do traje ${item.nomeTraje}`}
                      value={condicoes[item.trajeId] ?? ''}
                      onChange={(e) => atualizarCondicao(item.trajeId, e.target.value as CondicaoTraje)}
                      className={`${styles['campo-select']} ${erroCondicoes ? styles['campo-input--erro'] : ''}`}
                      disabled={estaEnviando}
                    >
                      {OPCOES_CONDICAO.map((op) => (
                        <option key={op.valor} value={op.valor}>
                          {op.rotulo}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              {erroCondicoes && (
                <span className={styles['campo-erro']} role="alert">
                  {erroCondicoes}
                </span>
              )}
            </div>
          )}

          <div className={styles['campo-grupo']}>
            <label htmlFor="valorMulta" className={styles['campo-label']}>
              Valor da Multa (R$)
            </label>
            <input
              id="valorMulta"
              type="text"
              inputMode="numeric"
              value={valorMulta}
              onChange={(e) => {
                const formatado = formatarMoedaBrPartindoDeDigitos(e.target.value);
                setValorMulta(formatado);
                if (erroValorMulta) setErroValorMulta('');
              }}
              className={`${styles['campo-input']} ${erroValorMulta ? styles['campo-input--erro'] : ''}`}
              placeholder="0,00"
              aria-describedby={erroValorMulta ? 'erro-valorMulta' : undefined}
              disabled={estaEnviando}
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
              disabled={estaEnviando}
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
