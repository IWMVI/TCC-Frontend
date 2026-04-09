import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { Modal } from '../../../../componentes/feedback/Modal/Modal';
import { criarTrajeUseCase, TRAJE_CONSTANTS } from '@application/trajes';
import { TrajeRequest } from '@domain/entidades';

export function CriarTraje() {
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  function voltarParaInicial() {
    setModalAberto(false);
    navigate(TRAJE_CONSTANTS.ROUTES.LISTA);
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