import { useCallback, useState } from 'react';
import { Modal } from '@/interfaces-graficas/componentes/feedback/Modal';

const TITULO_PADRAO = 'Descartar informações?';
const MENSAGEM_PADRAO =
  'Todas as informações preenchidas serão perdidas. Deseja continuar e voltar ao dashboard?';

interface UseConfirmarCancelarCadastroOpcoes {
  titulo?: string;
  mensagem?: string;
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
}

export function useConfirmarCancelarCadastro(
  aoConfirmarSaida: () => void,
  opcoes?: UseConfirmarCancelarCadastroOpcoes,
) {
  const [modalAberto, setModalAberto] = useState(false);

  const solicitarCancelamento = useCallback(() => {
    setModalAberto(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
  }, []);

  const confirmarSaida = useCallback(() => {
    setModalAberto(false);
    aoConfirmarSaida();
  }, [aoConfirmarSaida]);

  const modalConfirmacao = (
    <Modal
      estaAberto={modalAberto}
      titulo={opcoes?.titulo ?? TITULO_PADRAO}
      mensagem={opcoes?.mensagem ?? MENSAGEM_PADRAO}
      aoConfirmar={confirmarSaida}
      aoCancelar={fecharModal}
      textoBotaoConfirmar={opcoes?.textoBotaoConfirmar ?? 'Sim, continuar'}
      textoBotaoCancelar={opcoes?.textoBotaoCancelar ?? 'Não, voltar'}
      tipoBotaoConfirmar="perigo"
    />
  );

  return {
    solicitarCancelamento,
    modalConfirmacao,
  };
}
