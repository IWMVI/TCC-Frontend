import {FormularioCliente} from '@/interfaces-graficas/paginas/clientes/componentes';
import {CriarClienteUseCase} from '@application/clientes';
import {ClienteRequest, ClienteResponse} from '@domain/entidades';
import {ClienteApiRepository} from '@infrastructure/api';
import {useEffect, useState} from 'react';
import {Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

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
	const [alertaSucesso, setAlertaSucesso] = useState(false);
	
	useEffect(() => {
		if (erro) {
			const timer = setTimeout(() => setErro(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [erro]);

  function irParaLista() {
	  setAlertaSucesso(false);
    if (modoModal && onCancelar) {
      onCancelar();
      return;
    }

    navigate('/clientes/listar');
  }
	
	async function handleSubmit(dados: ClienteRequest): Promise<number | undefined> {
    setErro(null);
    setEstaEnviando(true);
    try {
      const criado = await criarClienteUseCase.executar(dados);
      if (modoModal) {
        onCadastroSucesso?.(criado);
        return criado.id;
      }
		
		setAlertaSucesso(true);
		setTimeout(() => irParaLista(), 2500);
      return criado.id;
	} catch {
		setErro('Não foi possível criar o cliente. Verifique os dados e tente novamente.');
		setAlertaSucesso(false);
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <>
		{alertaSucesso && (
			<Alert
				variant="success"
			    onClose={irParaLista}
			    dismissible
			    className="alerta-auto"
			    style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px'}}
			>
				<Alert.Heading>Cliente criado!</Alert.Heading>
				<p>Redirecionando para a lista de clientes...</p>
			</Alert>
		)}
		
		{erro && !alertaSucesso && (
			<Alert
				variant="danger"
			    onClose={() => setErro(null)}
			    dismissible
			    className="alerta-auto"
			    style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px'}}
			>
				<Alert.Heading>Falha ao criar cliente</Alert.Heading>
				<p>{erro}</p>
			</Alert>
		)}

      <FormularioCliente
        titulo="Cadastrar Novo Cliente"
        estaEnviando={estaEnviando}
        erro={null}
        onSubmit={handleSubmit}
        modoModal={modoModal}
        onCancel={onCancelar}
      />
    </>
  );
}
