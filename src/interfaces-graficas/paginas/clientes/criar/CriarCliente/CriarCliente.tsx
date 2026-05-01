import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioCliente } from '@/interfaces-graficas/paginas/clientes/componentes';
import { Modal } from '@/interfaces-graficas/componentes/feedback/Modal/Modal';
import { CriarClienteUseCase } from '@application/clientes';
import { ClienteApiRepository } from '@infrastructure/api';
import { ClienteRequest, ClienteResponse } from '@domain/entidades';

const clienteRepositorio = new ClienteApiRepository();
const criarClienteUseCase = new CriarClienteUseCase(clienteRepositorio);

interface CriarClienteProps {
  modoModal?: boolean;
  onCadastroSucesso?: (cliente: ClienteResponse) => void;
  onCancelar?: () => void;
}

export function CriarCliente({
  modoModal = false,
  onCadastroSucesso,
  onCancelar,
}: Readonly<CriarClienteProps>) {
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

    navigate('/dashboard');
  }

  async function handleSubmit(dados: ClienteRequest): Promise<number> {
    setErro(null);
    setEstaEnviando(true);
    try {
      const criado = await criarClienteUseCase.executar(dados);
      if (modoModal) {
        onCadastroSucesso?.(criado);
        return criado.id;
      }

      setModalTitulo('Sucesso');
      setModalMensagem('Cliente criado com sucesso.');
      setModalAberto(true);
      return criado.id;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setErro(mensagem);
      if (!modoModal) {
        setModalTitulo('Falha');
        setModalMensagem(`Não foi possível criar cliente: ${mensagem}`);
        setModalAberto(true);
      }
      throw err;
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <>
      <FormularioCliente
        titulo="Cadastrar Novo Cliente"
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
          textoBotaoConfirmar="Ir para início"
          textoBotaoCancelar="Fechar"
          tipoBotaoConfirmar={modalTitulo === 'Sucesso' ? 'primario' : 'perigo'}
        />
      )}
    </>
  );
}
