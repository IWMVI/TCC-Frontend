import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Modal, Botao, Card } from '@/interfaces-graficas/componentes';
import { CriarAluguelUseCase } from '@application/alugueis';
import { AluguelApiRepository } from '@infrastructure/api';
import {
	AluguelRequest,
	AluguelItemRequest,
	ClienteResponse,
	TipoOcasiao,
	Traje,
} from '@domain/entidades';
import { SelecionadorCliente } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorCliente';
import { SelecionadorTraje } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorTraje';
import { DetalhesAluguel } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/DetalhesAluguel';
import {
	converterMoedaBrParaNumero,
	formatarMoedaBrPartindoDeDigitos,
	formatarNumeroParaMoedaBr,
} from '@/interfaces-graficas/utils/formatacoes';
import styles from '@/interfaces-graficas/paginas/alugueis/realizar/RealizarAluguel.module.css';

const aluguelRepositorio = new AluguelApiRepository();
const criarAluguelUseCase = new CriarAluguelUseCase(aluguelRepositorio);

interface ItemSelecionado {
  trajeId: number;
  traje: Traje;
}

export function RealizarAluguel() {
  const navigate = useNavigate();
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponse | null>(null);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
	const [observacoes, setObservacoes] = useState('');
	const [ocasiao, setOcasiao] = useState<TipoOcasiao | ''>('');
	const [valorDesconto, setValorDesconto] = useState('0,00');

  const [estaEnviando, setEstaEnviando] = useState(false);
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

  function voltarParaInicial() {
    setModalAberto(false);
    navigate('/alugueis');
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
	
	function handleValorDescontoChange(valor: string) {
		const descontoFormatado = formatarMoedaBrPartindoDeDigitos(valor);
		const descontoDigitado = converterMoedaBrParaNumero(descontoFormatado);
		const subtotalAtual = calcularSubtotal();
		const descontoFinal = Math.min(descontoDigitado, subtotalAtual);
		setValorDesconto(formatarNumeroParaMoedaBr(descontoFinal));
  }

  async function handleRealizarAluguel() {
    if (!clienteSelecionado) {
      setModalTitulo('Erro');
      setModalMensagem('Selecione um cliente');
      setModalAberto(true);
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
		  setModalMensagem('Preencha data de retirada e devolucao');
      setModalAberto(true);
      return;
    }
	  
	  if (!ocasiao) {
      setModalTitulo('Erro');
		  setModalMensagem('Selecione a ocasiao');
      setModalAberto(true);
      return;
    }

    if (dataDevolucao <= dataRetirada) {
      setModalTitulo('Erro');
		setModalMensagem('Data de devolucao deve ser apos a data de retirada');
		setModalAberto(true);
		return;
	}
	  
	  if (descontoNumerico > calcularSubtotal()) {
		  setModalTitulo('Erro');
		  setModalMensagem('O desconto nao pode ser maior que o valor total dos itens');
      setModalAberto(true);
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
      setModalTitulo('Sucesso');
      setModalMensagem('Aluguel realizado com sucesso.');
      setModalAberto(true);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao realizar aluguel';
      setModalTitulo('Falha');
		setModalMensagem(`Nao foi possivel realizar aluguel: ${mensagem}`);
      setModalAberto(true);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <div className={styles.realizarAluguel}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.botaoVoltar}
          onClick={() => navigate('/alugueis')}
          title="Voltar"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
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
            total={calcularTotal()}
            onDataRetiradaChange={setDataRetirada}
            onDataDevolucaoChange={setDataDevolucao}
            onObservacoesChange={setObservacoes}
            onOcasiaoChange={setOcasiao}
            onValorDescontoChange={handleValorDescontoChange}
          />
        </Card>

        <div className={styles.acoes}>
			<Botao tipo="primario" onClick={handleRealizarAluguel} disabled={estaEnviando}>
            {estaEnviando ? 'Processando...' : 'Realizar Aluguel'}
          </Botao>
			<Botao tipo="perigo" onClick={() => navigate('/alugueis')} disabled={estaEnviando}>
            Cancelar
          </Botao>
        </div>
      </main>

      <Modal
        titulo={modalTitulo}
        mensagem={modalMensagem}
        estaAberto={modalAberto}
        aoConfirmar={modalTitulo === 'Sucesso' ? voltarParaInicial : () => setModalAberto(false)}
        aoCancelar={() => setModalAberto(false)}
        textoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'Ir para alugueis' : 'Ok'}
        textoBotaoCancelar="Fechar"
        tipoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'primario' : 'perigo'}
      />
    </div>
  );
}
