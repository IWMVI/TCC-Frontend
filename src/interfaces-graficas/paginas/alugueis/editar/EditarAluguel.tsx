import { Botao, Card } from '@/interfaces-graficas/componentes';
import styles from '@/interfaces-graficas/paginas/alugueis/editar/EditarAluguel.module.css';
import { DetalhesAluguel } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/DetalhesAluguel';
import { SelecionadorTraje } from '@/interfaces-graficas/paginas/alugueis/realizar/componentes/SelecionadorTraje';
import { obterTipoOcasiaoPorValor } from '@/interfaces-graficas/paginas/alugueis/utils/ocasiao';
import {
  obterAliasStatusAluguel,
  obterStatusAluguelPorValor,
} from '@/interfaces-graficas/paginas/alugueis/utils/status';
import {
  converterMoedaBrParaNumero,
  formatarMoedaBrPartindoDeDigitos,
  formatarNumeroParaMoedaBr,
  mascararCpfCnpj,
} from '@/interfaces-graficas/utils/formatacoes';
import { AtualizarAluguelUseCase, BuscarAluguelPorIdUseCase } from '@application/alugueis';
import { BuscarTrajePorIdUseCase } from '@application/trajes';
import {
	AluguelItemRequest,
	AluguelResponse,
	AluguelUpdateRequest,
	StatusAluguel,
	TipoOcasiao,
	Traje,
} from '@domain/entidades';
import { AluguelApiRepository, TrajeApiRepository } from '@infrastructure/api';
import { usePeriodosOcupadosTrajes } from '@/interfaces-graficas/paginas/alugueis/hooks/usePeriodosOcupadosTrajes';
import {
  dataDevolucaoComConflitoReserva,
  dataDevolucaoIndisponivel,
  periodosConflitam,
} from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { id } = useParams<{ id: string }>();
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

  const [alertaSucesso, setAlertaSucesso] = useState<string | null>(null);
  const [alertaErro, setAlertaErro] = useState<string | null>(null);

  useEffect(() => {
    if (alertaSucesso) {
      const timer = setTimeout(() => {
        setAlertaSucesso(null);
        navigate('/alugueis/listar', { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [alertaSucesso, navigate]);

  useEffect(() => {
    if (alertaErro) {
      const timer = setTimeout(() => setAlertaErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertaErro]);

  const calcularSubtotal = useCallback(() => {
    return itensSelecionados.reduce((total, item) => total + (item.traje.preco || 0), 0);
  }, [itensSelecionados]);

  const descontoNumerico = converterMoedaBrParaNumero(valorDesconto);
  const trajeIds = itensSelecionados.map((item) => item.trajeId);
  const dataRetiradaOriginal = aluguel?.dataRetirada?.split('T')[0];
  const dataDevolucaoOriginal = aluguel?.dataDevolucao?.split('T')[0];
  const { periodosOcupados, estaCarregando: carregandoPeriodos } = usePeriodosOcupadosTrajes({
    trajeIds,
    trajeRepository: trajeRepositorio,
    dataRetiradaIgnorar: dataRetiradaOriginal,
    dataDevolucaoIgnorar: dataDevolucaoOriginal,
  });

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
            return { trajeId: item.trajeId, traje: traje as unknown as Traje };
          })
        );
        setItensSelecionados(trajesDetalhados);
      } catch {
        setAlertaErro('Não foi possível carregar o aluguel');
      } finally {
        setEstaCarregando(false);
      }
    }

    if (aluguelId > 0) {
      carregarAluguel();
    }
  }, [aluguelId]);

	function adicionarTraje(traje: Traje) {
		if (!traje.id) {
			return;
		}

    const trajeId = traje.id;

    setItensSelecionados((estadoAtual) => {
      if (estadoAtual.some((item) => item.trajeId === trajeId)) {
        return estadoAtual;
      }

      return [...estadoAtual, { trajeId, traje }];
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

  async function handleAtualizar() {
    if (!aluguel) {
      return;
    }

    if (itensSelecionados.length === 0) {
      setAlertaErro('Adicione pelo menos um traje');
      return;
    }

    if (!dataRetirada || !dataDevolucao) {
      setAlertaErro('Preencha data de retirada e devolução');
      return;
    }

    if (!ocasiao) {
      setAlertaErro('Selecione a ocasião');
      return;
    }

    if (!status) {
      setAlertaErro('Selecione o status');
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
      setAlertaErro('O desconto não pode ser maior que o valor total dos itens');
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
      setAlertaSucesso('Aluguel atualizado com sucesso');
    } catch {
      setAlertaErro('Não foi possível atualizar o aluguel. Verifique os dados e tente novamente');
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
          onClick={() => navigate('/alugueis/listar', { replace: true })}
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
            valorMulta={aluguel?.valorMulta ?? 0}
            periodosOcupados={periodosOcupados}
            carregandoPeriodos={carregandoPeriodos}
            onDataRetiradaChange={handleDataRetiradaChange}
            onDataDevolucaoChange={handleDataDevolucaoChange}
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
          <Botao
            tipo="perigo"
            onClick={() => navigate('/alugueis/listar', { replace: true })}
            disabled={estaEnviando}
          >
            Cancelar
          </Botao>
        </div>
      </main>

      {alertaSucesso && (
        <Alert
          variant="success"
          onClose={() => setAlertaSucesso(null)}
          dismissible
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px' }}
        >
          <Alert.Heading>Sucesso</Alert.Heading>
          <p>{alertaSucesso}</p>
        </Alert>
      )}

      {alertaErro && (
        <Alert
          variant="danger"
          onClose={() => setAlertaErro(null)}
          dismissible
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px' }}
        >
          <Alert.Heading>Erro</Alert.Heading>
          <p>{alertaErro}</p>
        </Alert>
      )}
    </div>
  );
}
