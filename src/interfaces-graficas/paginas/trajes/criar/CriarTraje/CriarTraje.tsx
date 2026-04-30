import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { Modal } from '../../../../componentes/feedback/Modal/Modal';
import { criarTrajeUseCase, TRAJE_CONSTANTS, trajeRepository } from '@application/trajes';
import { TrajeRequest, TrajeResponse } from '@domain/entidades';

interface CriarTrajeProps {
  modoModal?: boolean;
  onCadastroSucesso?: (traje: TrajeResponse) => void;
  onCancelar?: () => void;
}

export function CriarTraje({
  modoModal = false,
  onCadastroSucesso,
  onCancelar,
}: Readonly<CriarTrajeProps>) {
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');

  function voltarParaInicial() {
    setModalAberto(false);
    if (modoModal && onCancelar) {
      onCancelar();
      return;
    }

    navigate(TRAJE_CONSTANTS.ROUTES.LISTA);
  }

  async function handleSubmit(dados: TrajeRequest): Promise<number> {
    setErro(null);
    setEstaEnviando(true);
    try {
      const temImagemNova = dados.imagemUrl?.startsWith('data:') ?? false;
      const dadosSemImagem = {
        ...dados,
        imagemUrl: temImagemNova ? '' : (dados.imagemUrl || ''),
      };

      const criado = await criarTrajeUseCase.executar(dadosSemImagem);

      if (temImagemNova && dados.imagemUrl) {
        const base64 = dados.imagemUrl.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], 'imagem.jpg', { type: 'image/jpeg' });

        await trajeRepository.atualizarImagem(criado.id, file);
      }

      if (modoModal) {
        onCadastroSucesso?.(criado);
        return criado.id;
      }

      setModalTitulo('Sucesso');
      setModalMensagem('Traje criado com sucesso.');
      setModalAberto(true);
      return criado.id;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar traje';
      setErro(mensagem);
      if (!modoModal) {
        setModalTitulo('Falha');
        setModalMensagem(`Não foi possível criar traje: ${mensagem}`);
        setModalAberto(true);
      }
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
        modoModal={modoModal}
        onCancel={onCancelar}
      />

      {!modoModal && (
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
      )}
    </>
  );
}