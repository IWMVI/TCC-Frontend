import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {Modal, Botao, Card, Calendario} from '../../../componentes';
import {BuscarAluguelPorIdUseCase, AtualizarAluguemUseCase} from '../../../../application/alugueis';
import { AluguemApiRepository } from '../../../../infrastructure/api';
import {AluguemResponse, AluguemUpdateRequest, TipoOcasiao} from '../../../../domain/entidades';
import {obterAliasTipoOcasiao} from '../utils/ocasiao';
import styles from './EditarAluguel.module.css';

const aluguelRepositorio = new AluguemApiRepository();
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);
const atualizarAluguemUseCase = new AtualizarAluguemUseCase(aluguelRepositorio);

const MAX_DESCONTO_DIGITOS = 8;

function formatarDescontoMoeda(valorDigitado: string): string {
	const apenasDigitos = valorDigitado.replace(/\D/g, '').slice(0, MAX_DESCONTO_DIGITOS);
	const centavos = Number.parseInt(apenasDigitos || '0', 10);
	
	return (centavos / 100).toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function EditarAluguel() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const aluguelId = parseInt(id || '0', 10);

  const [aluguel, setAluguel] = useState<AluguemResponse | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [estaEnviando, setEstaEnviando] = useState(false);
	const [itensModalAberto, setItensModalAberto] = useState(false);

  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
	const [observacoes, setObservacoes] = useState('');
	const [ocasiao, setOcasiao] = useState<TipoOcasiao | ''>('');
	const [valorDesconto, setValorDesconto] = useState('0,00');

  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  useEffect(() => {
    async function carregarAluguel() {
      try {
        const dados = await buscarAluguelPorIdUseCase.executar(aluguelId);
        setAluguel(dados);
		  setDataRetirada(dados.dataRetirada?.split('T')[0] || '');
		  setDataDevolucao(dados.dataDevolucao?.split('T')[0] || '');
		  setObservacoes(dados.observacoes || '');
		  setOcasiao(dados.ocasiao || '');
		  setValorDesconto(formatarDescontoMoeda(String((dados.valorDesconto ?? 0) * 100)));
	  } catch {
        setModalTitulo('Erro');
        setModalMensagem('Erro ao carregar aluguel');
        setModalAberto(true);
      } finally {
        setEstaCarregando(false);
      }
    }

    if (aluguelId > 0) {
      carregarAluguel();
    }
  }, [aluguelId]);

  function voltarParaLista() {
    setModalAberto(false);
    navigate('/alugueis/listar');
  }
	
	function handleValorDescontoChange(valor: string) {
		setValorDesconto(formatarDescontoMoeda(valor));
	}

  async function handleAtualizar() {
	  if (!aluguel || !dataRetirada || !dataDevolucao || !ocasiao) {
      setModalTitulo('Erro');
		  setModalMensagem('Preencha todos os campos obrigatórios');
      setModalAberto(true);
      return;
    }

    if (dataDevolucao <= dataRetirada) {
      setModalTitulo('Erro');
      setModalMensagem('Data de devolução deve ser após a data de retirada');
      setModalAberto(true);
      return;
    }

    try {
      setEstaEnviando(true);
		
		const dadosAtualizacao: AluguemUpdateRequest = {
        dataRetirada,
        dataDevolucao,
			observacoes: observacoes.trim() || undefined,
			ocasiao,
			valorDesconto:
				Number.parseFloat(valorDesconto.replace(/\./g, '').replace(',', '.')) || 0,
      };

      await atualizarAluguemUseCase.executar(aluguelId, dadosAtualizacao);
      setModalTitulo('Sucesso');
      setModalMensagem('Aluguel atualizado com sucesso');
      setModalAberto(true);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao atualizar aluguel';
      setModalTitulo('Erro');
      setModalMensagem(`Não foi possível atualizar aluguel: ${mensagem}`);
      setModalAberto(true);
    } finally {
      setEstaEnviando(false);
    }
  }

  if (estaCarregando) {
    return (
      <div className={styles.editarAluguel}>
        <p className={styles.carregando}>Carregando...</p>
      </div>
    );
  }

  if (!aluguel) {
    return (
      <div className={styles.editarAluguel}>
        <p className={styles.erro}>Aluguel não encontrado</p>
      </div>
    );
  }
	
	const descontoNumerico =
		Number.parseFloat(valorDesconto.replace(/\./g, '').replace(',', '.')) || 0;

  return (
    <div className={styles.editarAluguel}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => navigate('/alugueis/listar')}
          title="Voltar"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className={styles.titulo}>
          <h1>Editar Aluguel</h1>
          <p>Atualize os detalhes do aluguel ID {aluguel.id}</p>
        </div>
      </header>

      <Card titulo="Editar Aluguel">
        <div className={styles.container}>
          <div className={styles.secaoInfo}>
            <h3>Informações do Cliente</h3>
            <div className={styles.infoCliente}>
              <p>
				  <strong>Cliente:</strong> {aluguel.nomeCliente}
              </p>
              <p>
				  <strong>Cliente ID:</strong> {aluguel.clienteId}
              </p>
            </div>
          </div>

          <div className={styles.secaoTrajes}>
			  <h3>Itens do Aluguel</h3>
			  <Botao tipo="secundario" onClick={() => setItensModalAberto(true)}>
				  Ver Itens do Aluguel
			  </Botao>
          </div>

          <div className={styles.secaoDatas}>
			  <h3>Dados do Aluguel</h3>
            <div className={styles.formulario}>
				<Calendario
					id="data-retirada"
		            label="Data de Retirada"
		            value={dataRetirada}
		            onChange={setDataRetirada}
		            required
				/>
				
				<Calendario
					id="data-devolucao"
		            label="Data de Devolução"
		            value={dataDevolucao}
		            onChange={setDataDevolucao}
		            required
				/>
				
				<div className={styles.campo}>
					<label htmlFor="ocasiao">Ocasião</label>
					<select
						id="ocasiao"
			            value={ocasiao}
			            onChange={(e) => setOcasiao(e.target.value as TipoOcasiao)}
                  className={styles.input}
					>
						<option value="">Selecione</option>
						{Object.values(TipoOcasiao).map((tipo) => (
							<option key={tipo} value={tipo}>
								{obterAliasTipoOcasiao(tipo)}
							</option>
						))}
					</select>
              </div>

              <div className={styles.campo}>
				  <label htmlFor="valor-desconto">Valor Desconto (R$)</label>
                <input
					id="valor-desconto"
	                type="text"
	                inputMode="numeric"
	                value={valorDesconto}
	                onChange={(e) => handleValorDescontoChange(e.target.value)}
                  className={styles.input}
	                placeholder="0,00"
				/>
			  </div>
				
				<div className={styles.campoCompleto}>
					<label htmlFor="observacoes">Observações</label>
					<textarea
						id="observacoes"
			            value={observacoes}
			            onChange={(e) => setObservacoes(e.target.value)}
			            maxLength={200}
			            className={styles.textarea}
                />
              </div>
            </div>
          </div>

          <div className={styles.secaoResumo}>
            <h3>Resumo Financeiro</h3>
            <div className={styles.resumo}>
              <p>
				  <strong>Valor Total:</strong> R$ {aluguel.valorTotal.toFixed(2)}
              </p>
              <p>
				  <strong>Valor Desconto:</strong> R$ {descontoNumerico.toFixed(2)}
              </p>
            </div>
          </div>

          <div className={styles.acoes}>
			  <Botao tipo="primario" onClick={handleAtualizar} disabled={estaEnviando}>
              {estaEnviando ? 'Salvando...' : 'Salvar Alterações'}
            </Botao>
            <Botao
              tipo="secundario"
              onClick={() => navigate('/alugueis/listar')}
              disabled={estaEnviando}
            >
              Cancelar
            </Botao>
          </div>
        </div>
      </Card>
		
		{itensModalAberto && (
			<div className={styles.modalOverlay}>
				<Card titulo="Itens do Aluguel">
					<div className={styles.modalConteudo}>
						{aluguel.itens?.length ? (
							aluguel.itens.map((item, index) => (
								<div key={`${item.trajeId}-${index}`} className={styles.item}>
									<span className={styles.nome}>{item.nomeTraje}</span>
								</div>
							))
						) : (
							<p className={styles.vazio}>Nenhum item associado</p>
						)}
						<div className={styles.modalAcoes}>
							<Botao onClick={() => setItensModalAberto(false)}>Fechar</Botao>
						</div>
					</div>
				</Card>
			</div>
		)}

      <Modal
        titulo={modalTitulo}
        mensagem={modalMensagem}
        estaAberto={modalAberto}
        aoConfirmar={modalTitulo === 'Sucesso' ? voltarParaLista : () => setModalAberto(false)}
        aoCancelar={() => setModalAberto(false)}
        textoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'Ir para lista' : 'Ok'}
        textoBotaoCancelar="Fechar"
        tipoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'primario' : 'perigo'}
      />
    </div>
  );
}
