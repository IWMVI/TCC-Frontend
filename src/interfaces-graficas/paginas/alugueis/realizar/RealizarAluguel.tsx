import { Botao, Card } from '@/interfaces-graficas/componentes';
import { DetalhesAluguel } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/DetalhesAluguel';
import { SelecionadorCliente } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorCliente';
import { SelecionadorTraje } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorTraje';
import styles from '@/interfaces-graficas/paginas/alugueis/realizar/RealizarAluguel.module.css';
import {
  converterMoedaBrParaNumero,
  formatarMoedaBrPartindoDeDigitos,
  formatarNumeroParaMoedaBr,
} from '@/interfaces-graficas/utils/formatacoes';
import { CriarAluguelUseCase } from '@application/alugueis';
import { AluguelItemRequest, AluguelRequest, ClienteResponse, TipoOcasiao, Traje } from '@domain/entidades';
import { AluguelApiRepository, TrajeApiRepository } from '@infrastructure/api';
import { usePeriodosOcupadosTrajes } from '@/interfaces-graficas/paginas/alugueis/hooks/usePeriodosOcupadosTrajes';
import {
  dataDevolucaoComConflitoReserva,
  dataDevolucaoIndisponivel,
  periodosConflitam,
} from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';
import {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {useConfirmarCancelarCadastro} from '@/interfaces-graficas/hooks/useConfirmarCancelarCadastro';

const aluguelRepositorio = new AluguelApiRepository();
const trajeRepositorio = new TrajeApiRepository();
const criarAluguelUseCase = new CriarAluguelUseCase(aluguelRepositorio);

interface ItemSelecionado {
  trajeId: number;
  traje: Traje;
}

export function RealizarAluguel() {
  const navigate = useNavigate();
  const { solicitarCancelamento, modalConfirmacao } = useConfirmarCancelarCadastro(() => {
    navigate('/dashboard');
  });
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponse | null>(null);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ocasiao, setOcasiao] = useState<TipoOcasiao | ''>('');
  const [valorDesconto, setValorDesconto] = useState('0,00');

  const [estaEnviando, setEstaEnviando] = useState(false);
  const [alertaSucesso, setAlertaSucesso] = useState(false);
  const [alertaErro, setAlertaErro] = useState<string | null>(null);

  useEffect(() => {
    if (alertaErro && !alertaSucesso) {
      const timer = setTimeout(() => setAlertaErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaErro, alertaSucesso]);

  const calcularSubtotal = useCallback(() => {
    return itensSelecionados.reduce((total, item) => total + (item.traje.preco || 0), 0);
  }, [itensSelecionados]);

  const descontoNumerico = converterMoedaBrParaNumero(valorDesconto);
  const trajeIds = itensSelecionados.map((item) => item.trajeId);
  const { periodosOcupados, estaCarregando: carregandoPeriodos } = usePeriodosOcupadosTrajes({
    trajeIds,
    trajeRepository: trajeRepositorio,
  });

  function voltarParaInicial() {
    setAlertaSucesso(false);
    navigate('/dashboard');
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
			
			return [
				...estadoAtual,
				{
					trajeId,
					traje,
				},
			];
		});
  }

  function removerTraje(index: number) {
	  setItensSelecionados((estadoAtual) => estadoAtual.filter((_, i) => i !== index));
  }

  function handleDataRetiradaChange(novaData: string) {
    setDataRetirada(novaData);
    if (
      dataDevolucao &&
      (dataDevolucao <= novaData ||
        dataDevolucaoIndisponivel(novaData, dataDevolucao, periodosOcupados))
    ) {
      setDataDevolucao('');
    }
  }

  function handleDataDevolucaoChange(novaData: string) {
    if (dataRetirada && novaData <= dataRetirada) {
      return;
    }
    if (dataRetirada && dataDevolucaoComConflitoReserva(dataRetirada, novaData, periodosOcupados)) {
      return;
    }
    setDataDevolucao(novaData);
  }

  function handleValorDescontoChange(valor: string) {
    const descontoFormatado = formatarMoedaBrPartindoDeDigitos(valor);
    const descontoDigitado = converterMoedaBrParaNumero(descontoFormatado);
    const subtotalAtual = calcularSubtotal();
    const descontoFinal = Math.min(descontoDigitado, subtotalAtual);
    setValorDesconto(formatarNumeroParaMoedaBr(descontoFinal));
  }

  async function handleRealizarAluguel() {
    setAlertaErro(null);

    if (!clienteSelecionado) {
      setAlertaErro('Selecione um cliente');
      return;
    }

    if (itensSelecionados.length === 0) {
      setAlertaErro('Adicione pelo menos um traje');
      return;
    }

    if (!dataRetirada || !dataDevolucao) {
      setAlertaErro('Preencha data de retirada e devolucao');
      return;
    }

    if (!ocasiao) {
      setAlertaErro('Selecione a ocasiao');
      return;
    }

    if (dataDevolucao <= dataRetirada) {
      setAlertaErro('A data de devolução deve ser posterior à data de retirada');
      return;
    }

    if (periodosConflitam(dataRetirada, dataDevolucao, periodosOcupados)) {
      setAlertaErro('Um ou mais trajes já estão reservados no período selecionado');
      return;
    }

    if (descontoNumerico > calcularSubtotal()) {
      setAlertaErro('O desconto nao pode ser maior que o valor total dos itens');
      return;
    }

    try {
      setEstaEnviando(true);

      const itens: AluguelItemRequest[] = itensSelecionados.map((item) => ({
        trajeId: item.trajeId,
      }));

      const dados: AluguelRequest = {
        clienteId: clienteSelecionado.id,
        dataRetirada,
        dataDevolucao,
        observacoes: observacoes.trim() || undefined,
        ocasiao,
        valorDesconto: descontoNumerico,
        itens,
      };

      await criarAluguelUseCase.executar(dados);
      setAlertaSucesso(true);
      setTimeout(() => voltarParaInicial(), 2500);
    } catch (erro) {
      const mensagem =
        erro instanceof Error && erro.message
          ? erro.message
          : 'Não foi possível realizar o aluguel. Verifique os dados e tente novamente.';
      setAlertaErro(mensagem);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className={styles.realizarAluguel}>
      {alertaSucesso && (
        <Alert
          variant="success"
          onClose={voltarParaInicial}
          dismissible
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px' }}
        >
          <Alert.Heading>Aluguel realizado!</Alert.Heading>
          <p>Redirecionando para a lista de aluguéis...</p>
        </Alert>
      )}

      {alertaErro && !alertaSucesso && (
        <Alert
          variant="warning"
          onClose={() => setAlertaErro(null)}
          dismissible
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px' }}
        >
          <Alert.Heading>Atenção</Alert.Heading>
          <p>{alertaErro}</p>
        </Alert>
      )}

      <header className={styles.header}>
        <div className={styles.titulo}>
          <h1>Realizar Aluguel</h1>
          <p>Selecione um cliente e trajes para registrar um novo aluguel</p>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.selecoes}>
          <div className={styles.secaoCliente}>
            <Card titulo="Selecao de Cliente">
              <SelecionadorCliente
                clienteSelecionado={clienteSelecionado}
                onClienteChange={setClienteSelecionado}
              />
            </Card>
          </div>

          <div className={styles.secaoTraje}>
            <Card titulo="Selecao de Trajes" className={styles.cardTrajes}>
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
            periodosOcupados={periodosOcupados}
            carregandoPeriodos={carregandoPeriodos}
            onDataRetiradaChange={handleDataRetiradaChange}
            onDataDevolucaoChange={handleDataDevolucaoChange}
            onObservacoesChange={setObservacoes}
            onOcasiaoChange={setOcasiao}
            onValorDescontoChange={handleValorDescontoChange}
          />
        </Card>

        <div className={styles.acoes}>
          <Botao tipo="primario" onClick={handleRealizarAluguel} disabled={estaEnviando}>
            {estaEnviando ? 'Processando...' : 'Realizar Aluguel'}
          </Botao>
          <Botao tipo="perigo" onClick={solicitarCancelamento} disabled={estaEnviando}>
            Cancelar
          </Botao>
        </div>
      </main>
      {modalConfirmacao}
    </div>
  );
}
