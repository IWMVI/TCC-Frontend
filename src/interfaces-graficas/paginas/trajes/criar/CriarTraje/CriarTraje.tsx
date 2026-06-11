import {FormularioTraje} from '@/interfaces-graficas/paginas/trajes/componentes';
import {criarTrajeUseCase, TRAJE_CONSTANTS, trajeRepository} from '@application/trajes';
import {TrajeRequest, TrajeResponse} from '@domain/entidades';
import {useEffect, useState} from 'react';
import {Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

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
	const [alertaSucesso, setAlertaSucesso] = useState(false);
	
	useEffect(() => {
		if (erro) {
			const timer = setTimeout(() => setErro(null), 5000);
			return () => clearTimeout(timer);
		}
	}, [erro]);

  function voltarParaInicial() {
	  setAlertaSucesso(false);
    if (modoModal && onCancelar) {
      onCancelar();
      return;
    }

    navigate(TRAJE_CONSTANTS.ROUTES.LISTA);
  }
	
	async function handleSubmit(dados: TrajeRequest): Promise<number | undefined> {
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
		
		setAlertaSucesso(true);
		setTimeout(() => voltarParaInicial(), 2500);
      return criado.id;
	} catch {
		setErro('Não foi possível criar o traje. Verifique os dados e tente novamente.');
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
			    onClose={voltarParaInicial}
			    dismissible
			    style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px'}}
			>
				<Alert.Heading>Traje criado!</Alert.Heading>
				<p>Redirecionando para a lista de trajes...</p>
			</Alert>
		)}
		
		{erro && !alertaSucesso && (
			<Alert
				variant="danger"
			    onClose={() => setErro(null)}
			    dismissible
			    style={{position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, minWidth: '300px'}}
			>
				<Alert.Heading>Falha ao criar traje</Alert.Heading>
				<p>{erro}</p>
			</Alert>
		)}

      <FormularioTraje
        titulo="Cadastrar Novo Traje"
        estaEnviando={estaEnviando}
        erro={null}
        onSubmit={handleSubmit}
        modoModal={modoModal}
        onCancel={onCancelar}
      />
    </>
  );
}