import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Modal, Botao, Card } from '../../../componentes';
import { 
  BuscarAluguelPorIdUseCase,
  AtualizarAluguemUseCase 
} from '../../../../application/alugueis';
import { AluguemApiRepository } from '../../../../infrastructure/api';
import { AluguemRequest, AluguemResponse } from '../../../../domain/entidades';
import styles from './EditarAluguel.module.css';

const aluguelRepositorio = new AluguemApiRepository();
const buscarAluguelPorIdUseCase = new BuscarAluguelPorIdUseCase(aluguelRepositorio);
const atualizarAluguemUseCase = new AtualizarAluguemUseCase(aluguelRepositorio);

export function EditarAluguel() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const aluguelId = parseInt(id || '0', 10);

  const [aluguel, setAluguel] = useState<AluguemResponse | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [estaEnviando, setEstaEnviando] = useState(false);

  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [desconto, setDesconto] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  useEffect(() => {
    async function carregarAluguel() {
      try {
        const dados = await buscarAluguelPorIdUseCase.executar(aluguelId);
        setAluguel(dados);
        setDataRetirada(dados.dataRetirada.split('T')[0]);
        setDataDevolucao(dados.dataDevolucao.split('T')[0]);
        setDesconto(dados.desconto);
      } catch (erro) {
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

  async function handleAtualizar() {
    if (!aluguel || !dataRetirada || !dataDevolucao) {
      setModalTitulo('Erro');
      setModalMensagem('Presencha todos os campos obrigatórios');
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

      const dadosAtualizacao: AluguemRequest = {
        clienteId: aluguel.clienteId,
        dataRetirada,
        dataDevolucao,
        desconto,
        itens: aluguel.itens?.map(item => ({
          trajeId: item.trajeId,
          tamanho: item.tamanho,
        })) || [],
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
                <strong>Cliente:</strong> {aluguel.cliente?.nome}
              </p>
              <p>
                <strong>E-mail:</strong> {aluguel.cliente?.email}
              </p>
              <p>
                <strong>Celular:</strong> {aluguel.cliente?.celular}
              </p>
            </div>
          </div>

          <div className={styles.secaoTrajes}>
            <h3>Trajes Alugados</h3>
            <div className={styles.listaTrajes}>
              {aluguel.itens && aluguel.itens.length > 0 ? (
                aluguel.itens.map((item: any, index: number) => (
                  <div key={index} className={styles.item}>
                    <span className={styles.nome}>{item.traje?.nome}</span>
                    <span className={styles.tamanho}>Tamanho: {item.tamanho}</span>
                    <span className={styles.preco}>R$ {item.traje?.preco?.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className={styles.vazio}>Nenhum traje associado</p>
              )}
            </div>
          </div>

          <div className={styles.secaoDatas}>
            <h3>Datas e Desconto</h3>
            <div className={styles.formulario}>
              <div className={styles.campo}>
                <label htmlFor="data-retirada">Data de Retirada</label>
                <input
                  id="data-retirada"
                  type="date"
                  value={dataRetirada}
                  onChange={(e) => setDataRetirada(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="data-devolucao">Data de Devolução</label>
                <input
                  id="data-devolucao"
                  type="date"
                  value={dataDevolucao}
                  onChange={(e) => setDataDevolucao(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="desconto">Desconto (R$)</label>
                <input
                  id="desconto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.secaoResumo}>
            <h3>Resumo Financeiro</h3>
            <div className={styles.resumo}>
              <p>
                <strong>Subtotal:</strong> R$ {aluguel.subtotal.toFixed(2)}
              </p>
              <p>
                <strong>Desconto:</strong> R$ {desconto.toFixed(2)}
              </p>
              <p className={styles.total}>
                <strong>Total:</strong> R$ {Math.max(0, aluguel.subtotal - desconto).toFixed(2)}
              </p>
            </div>
          </div>

          <div className={styles.acoes}>
            <Botao
              tipo="primario"
              onClick={handleAtualizar}
              disabled={estaEnviando}
            >
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
