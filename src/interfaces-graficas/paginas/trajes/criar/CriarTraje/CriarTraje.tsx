import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { Modal } from '../../../../componentes/feedback/Modal/Modal';
import { CriarTrajeUseCase } from '../../../../../application/trajes';
import { TrajeApiRepository } from '../../../../../infrastructure/api';
import { TrajeRequest } from '../../../../../domain/entidades';

// TODO: mudar as propriedades do traje depois para o que foi definido no prototipo HI-FI, e o formulário irá ser atualizado para refletir essas mudanças.

const trajeRepositorio = new TrajeApiRepository();
const criarTrajeUseCase = new CriarTrajeUseCase(trajeRepositorio);

export function CriarTraje() {
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  function voltarParaInicial() {
    setModalAberto(false);
    navigate('/trajes');
  }

  async function handleSubmit(dados: TrajeRequest): Promise<number> {
    setErro(null);
    setEstaEnviando(true);
    try {
      const criado = await criarTrajeUseCase.executar(dados);
      setModalTitulo('Sucesso');
      setModalMensagem('Traje criado com sucesso.');
      setModalAberto(true);
      return criado.id;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar traje';
      setErro(mensagem);
      setModalTitulo('Falha');
      setModalMensagem(`Não foi possível criar traje: ${mensagem}`);
      setModalAberto(true);
      throw err;
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <>
      <FormularioTraje
        titulo="Cadastrar Novo Traje"
        estaEnviando={estaEnviando}
        erro={erro}
        onSubmit={handleSubmit}
      />

      <Modal
        titulo={modalTitulo}
        mensagem={modalMensagem}
        estaAberto={modalAberto}
        aoConfirmar={voltarParaInicial}
        aoCancelar={voltarParaInicial}
        textoBotaoConfirmar="Ir para trajes"
        textoBotaoCancelar="Fechar"
        tipoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'primario' : 'perigo'}
      />
    </>
  );
}