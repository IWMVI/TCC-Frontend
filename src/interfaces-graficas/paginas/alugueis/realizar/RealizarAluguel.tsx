import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Modal, Botao, Card } from '../../../componentes';
import { CriarAluguemUseCase } from '../../../../application/alugueis';
import { AluguemApiRepository } from '../../../../infrastructure/api';
import { AluguemRequest, AluguemItemRequest, ClienteResponse, Traje } from '../../../../domain/entidades';
import { SelecionadorCliente } from './componentes/SelecionadorCliente';
import { SelecionadorTraje } from './componentes/SelecionadorTraje';
import { DetalhesAluguel } from './componentes/DetalhesAluguel';
import styles from './RealizarAluguel.module.css';

const aluguelRepositorio = new AluguemApiRepository();
const criarAluguemUseCase = new CriarAluguemUseCase(aluguelRepositorio);

interface ItemSelecionado {
  trajeId: number;
  traje: Traje;
  tamanho: string;
}

export function RealizarAluguel() {
  const navigate = useNavigate();
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponse | null>(null);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [desconto, setDesconto] = useState(0);

  const [estaEnviando, setEstaEnviando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  const calcularSubtotal = useCallback(() => {
    return itensSelecionados.reduce((total, item) => {
      return total + (item.traje.preco || 0);
    }, 0);
  }, [itensSelecionados]);

  const calcularTotal = useCallback(() => {
    const subtotal = calcularSubtotal();
    return Math.max(0, subtotal - desconto);
  }, [calcularSubtotal, desconto]);

  function voltarParaInicial() {
    setModalAberto(false);
    navigate('/alugueis');
  }

  function adicionarTraje(traje: Traje, tamanho: string) {
    const novoItem: ItemSelecionado = {
      trajeId: traje.id!,
      traje,
      tamanho,
    };
    setItensSelecionados([...itensSelecionados, novoItem]);
  }

  function removerTraje(index: number) {
    setItensSelecionados(itensSelecionados.filter((_, i) => i !== index));
  }

  async function handleRealizarAluguel() {
    // Validações
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

    if (!dataRetirada) {
      setModalTitulo('Erro');
      setModalMensagem('Defina a data de retirada');
      setModalAberto(true);
      return;
    }

    if (!dataDevolucao) {
      setModalTitulo('Erro');
      setModalMensagem('Defina a data de devolução');
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

      const itens: AluguemItemRequest[] = itensSelecionados.map(item => ({
        trajeId: item.trajeId,
        tamanho: item.tamanho,
      }));

      const dados: AluguemRequest = {
        clienteId: clienteSelecionado.id,
        dataRetirada,
        dataDevolucao,
        desconto,
        itens,
      };

      await criarAluguemUseCase.executar(dados);
      setModalTitulo('Sucesso');
      setModalMensagem('Aluguel realizado com sucesso.');
      setModalAberto(true);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao realizar aluguel';
      setModalTitulo('Falha');
      setModalMensagem(`Não foi possível realizar aluguel: ${mensagem}`);
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
            <Card titulo="Seleção de Cliente">
              <SelecionadorCliente
                clienteSelecionado={clienteSelecionado}
                onClienteChange={setClienteSelecionado}
              />
            </Card>
          </div>

          <div className={styles.secaoTraje}>
            <Card titulo="Seleção de Trajes">
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
            desconto={desconto}
            subtotal={calcularSubtotal()}
            total={calcularTotal()}
            onDataRetiradaChange={setDataRetirada}
            onDataDevolucaoChange={setDataDevolucao}
            onDescontoChange={setDesconto}
          />
        </Card>

        <div className={styles.acoes}>
          <Botao
            tipo="primario"
            onClick={handleRealizarAluguel}
            disabled={estaEnviando}
          >
            {estaEnviando ? 'Processando...' : 'Realizar Aluguel'}
          </Botao>
          <Botao
            tipo="perigo"
            onClick={() => navigate('/alugueis')}
            disabled={estaEnviando}
          >
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
        textoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'Ir para aluguéis' : 'Ok'}
        textoBotaoCancelar="Fechar"
        tipoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'primario' : 'perigo'}
      />
    </div>
  );
}
