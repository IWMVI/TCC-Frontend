import {useState, useEffect, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {Modal, Botao, Card} from '../../../componentes';
import {
	BuscarAluguelPorIdUseCase,
	AtualizarAluguelUseCase,
} from '../../../../application/alugueis';
import {BuscarTrajePorIdUseCase} from '../../../../application/trajes';
import {AluguelApiRepository, TrajeApiRepository} from '../../../../infrastructure/api';
import {
	AluguelItemRequest,
	AluguelResponse,
	AluguelUpdateRequest,
	StatusAluguel,
	TipoOcasiao,
	Traje,
} from '../../../../domain/entidades';
import {
	converterMoedaBrParaNumero,
	formatarMoedaBrPartindoDeDigitos,
	formatarNumeroParaMoedaBr,
	mascararCpfCnpj,
} from '../../../utils/formatacoes';
import {SelecionadorTraje} from '../realizar/componentes/SelecionadorTraje';
import {DetalhesAluguel} from '../realizar/componentes/DetalhesAluguel';
import {obterTipoOcasiaoPorValor} from '../utils/ocasiao';
import {obterAliasStatusAluguel, obterStatusAluguelPorValor} from '../utils/status';
import styles from './EditarAluguel.module.css';

const aluguelRepositorio = new AluguelApiRepository();
const trajeRepositorio = new TrajeApiRepository();
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);
const atualizarAluguelUseCase = new AtualizarAluguelUseCase(aluguelRepositorio);
const buscarTrajePorIdUseCase = new BuscarTrajePorIdUseCase(trajeRepositorio);

interface ItemSelecionado {
	trajeId: number;
	traje: Traje;
}

export function EditarAluguel() {
	const navigate = useNavigate();
	const {id} = useParams<{id: string}>();
	const aluguelId = parseInt(id || '0', 10);

	const [aluguel, setAluguel] = useState<AluguelResponse | null>(null);
	const [estaCarregando, setEstaCarregando] = useState(true);
	const [estaEnviando, setEstaEnviando] = useState(false);

	const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
	const [dataRetirada, setDataRetirada] = useState('');
	const [dataDevolucao, setDataDevolucao] = useState('');
	const [observacoes, setObservacoes] = useState('');
	const [ocasiao, setOcasiao] = useState<TipoOcasiao | ''>('');
	const [status, setStatus] = useState<StatusAluguel | ''>('');
	const [valorDesconto, setValorDesconto] = useState('0,00');

	const [modalAberto, setModalAberto] = useState(false);
	const [modalTitulo, setModalTitulo] = useState('');
	const [modalMensagem, setModalMensagem] = useState('');

	const calcularSubtotal = useCallback(() => {
		return itensSelecionados.reduce((total, item) => total + (item.traje.preco || 0), 0);
	}, [itensSelecionados]);

	const descontoNumerico = converterMoedaBrParaNumero(valorDesconto);

	const calcularTotal = useCallback(() => {
		const subtotal = calcularSubtotal();
		return Math.max(0, subtotal - descontoNumerico);
	}, [calcularSubtotal, descontoNumerico]);

	useEffect(() => {
		async function carregarAluguel() {
			try {
				const dados = await buscarAluguelPorIdUseCase.executar(aluguelId);
				setAluguel(dados);
				setDataRetirada(dados.dataRetirada?.split('T')[0] || '');
				setDataDevolucao(dados.dataDevolucao?.split('T')[0] || '');
				setObservacoes(dados.observacoes || '');
				setOcasiao(obterTipoOcasiaoPorValor(dados.ocasiao));
				setStatus(obterStatusAluguelPorValor(dados.status) || StatusAluguel.ATIVO);
				setValorDesconto(formatarNumeroParaMoedaBr(dados.valorDesconto ?? 0));

				const itens = dados.itens ?? [];
				const trajesDetalhados = await Promise.all(
					itens.map(async (item) => {
						const traje = await buscarTrajePorIdUseCase.executar(item.trajeId);
						return {trajeId: item.trajeId, traje: traje as unknown as Traje};
					}),
				);
				setItensSelecionados(trajesDetalhados);
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

	function irParaLista() {
		navigate('/alugueis/listar', {replace: true});
	}

	function voltarParaLista() {
		setModalAberto(false);
		irParaLista();
	}

	function adicionarTraje(traje: Traje) {
		if (!traje.id) {
			return;
		}

		const trajeId = traje.id;

		setItensSelecionados((estadoAtual) => {
			if (estadoAtual.some((item) => item.trajeId === trajeId)) {
				return estadoAtual;
			}

			return [...estadoAtual, {trajeId, traje}];
		});
	}

	function removerTraje(index: number) {
		setItensSelecionados((estadoAtual) => estadoAtual.filter((_, i) => i !== index));
	}

	function handleValorDescontoChange(valor: string) {
		const descontoFormatado = formatarMoedaBrPartindoDeDigitos(valor);
		const descontoDigitado = converterMoedaBrParaNumero(descontoFormatado);
		const subtotalAtual = calcularSubtotal();
		const descontoFinal = Math.min(descontoDigitado, subtotalAtual);
		setValorDesconto(formatarNumeroParaMoedaBr(descontoFinal));
	}

	async function handleAtualizar() {
		if (!aluguel) {
			return;
		}

		if (itensSelecionados.length === 0) {
			setModalTitulo('Erro');
			setModalMensagem('Adicione pelo menos um traje');
			setModalAberto(true);
			return;
		}

		if (!dataRetirada || !dataDevolucao) {
			setModalTitulo('Erro');
			setModalMensagem('Preencha data de retirada e devolução');
			setModalAberto(true);
			return;
		}

		if (!ocasiao) {
			setModalTitulo('Erro');
			setModalMensagem('Selecione a ocasião');
			setModalAberto(true);
			return;
		}

		if (!status) {
			setModalTitulo('Erro');
			setModalMensagem('Selecione o status');
			setModalAberto(true);
			return;
		}

		if (dataDevolucao <= dataRetirada) {
			setModalTitulo('Erro');
			setModalMensagem('Data de devolução deve ser após a data de retirada');
			setModalAberto(true);
			return;
		}

		if (descontoNumerico > calcularSubtotal()) {
			setModalTitulo('Erro');
			setModalMensagem('O desconto não pode ser maior que o valor total dos itens');
			setModalAberto(true);
			return;
		}

		try {
			setEstaEnviando(true);

			const itens: AluguelItemRequest[] = itensSelecionados.map((item) => ({
				trajeId: item.trajeId,
			}));

			const dados: AluguelUpdateRequest = {
				dataRetirada,
				dataDevolucao,
				observacoes: observacoes.trim() || undefined,
				ocasiao,
				status,
				valorDesconto: descontoNumerico,
				itens,
			};

			await atualizarAluguelUseCase.executar(aluguelId, dados);
			setModalTitulo('Sucesso');
			setModalMensagem('Aluguel atualizado com sucesso.');
			setModalAberto(true);
		} catch (erro) {
			const mensagem = erro instanceof Error ? erro.message : 'Erro ao atualizar aluguel';
			setModalTitulo('Falha');
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

	return (
		<div className={styles.editarAluguel}>
			<header className={styles.header}>
				<button
					type="button"
					className={styles.botaoVoltar}
					onClick={irParaLista}
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

			<main className={styles.container}>
				<div className={styles.selecoes}>
					<div className={styles.secaoCliente}>
						<Card titulo="Cliente">
							<div className={styles.infoCliente}>
								<p>
									<strong>Nome:</strong> {aluguel.nomeCliente}
								</p>
								<p>
									<strong>ID:</strong> {aluguel.clienteId}
								</p>
								{aluguel.cliente?.cpfCnpj && (
									<p>
										<strong>CPF/CNPJ:</strong> {mascararCpfCnpj(aluguel.cliente.cpfCnpj)}
									</p>
								)}
							</div>
						</Card>
					</div>

					<div className={styles.secaoTraje}>
						<Card titulo="Seleção de Trajes" className={styles.cardTrajes}>
							<SelecionadorTraje
								itensSelecionados={itensSelecionados}
								onAdicionarTraje={adicionarTraje}
								onRemoverTraje={removerTraje}
							/>
						</Card>
					</div>
				</div>

				<Card titulo="Detalhes do Aluguel" className={styles.detalhes}>
					<DetalhesAluguel
						dataRetirada={dataRetirada}
						dataDevolucao={dataDevolucao}
						observacoes={observacoes}
						ocasiao={ocasiao}
						valorDesconto={valorDesconto}
						subtotal={calcularSubtotal()}
						total={calcularTotal()}
						onDataRetiradaChange={setDataRetirada}
						onDataDevolucaoChange={setDataDevolucao}
						onObservacoesChange={setObservacoes}
						onOcasiaoChange={setOcasiao}
						onValorDescontoChange={handleValorDescontoChange}
					/>
				</Card>

				<Card titulo="Status do Aluguel" className={styles.detalhes}>
					<div className={styles.campo}>
						<label htmlFor="status">Status</label>
						<select
							id="status"
							value={status}
							onChange={(e) => setStatus(e.target.value as StatusAluguel)}
							className={styles.input}
						>
							<option value="">Selecione</option>
							{Object.values(StatusAluguel).map((valor) => (
								<option key={valor} value={valor}>
									{obterAliasStatusAluguel(valor)}
								</option>
							))}
						</select>
					</div>
				</Card>

				<div className={styles.acoes}>
					<Botao tipo="primario" onClick={handleAtualizar} disabled={estaEnviando}>
						{estaEnviando ? 'Salvando...' : 'Salvar Alterações'}
					</Botao>
					<Botao tipo="perigo" onClick={irParaLista} disabled={estaEnviando}>
						Cancelar
					</Botao>
				</div>
			</main>

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
