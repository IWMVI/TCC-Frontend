import {useState} from 'react';
import {FormularioCliente} from '../../componentes';
import {CriarClienteUseCase} from '../../../../../application/clientes';
import {ClienteApiRepositorio} from '../../../../../infrastructure/api';
import {ClienteRequest} from '../../../../../domain/entidades';

const clienteRepositorio = new ClienteApiRepositorio();
const criarClienteUseCase = new CriarClienteUseCase(clienteRepositorio);

export function CriarCliente() {
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

    async function handleSubmit(dados: ClienteRequest): Promise<number> {
    setErro(null);
    setEstaEnviando(true);
    try {
        const criado = await criarClienteUseCase.executar(dados);
        return criado.id;
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente');
        throw err;
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <FormularioCliente
        titulo="Cadastrar Novo Cliente"
      estaEnviando={estaEnviando}
      erro={erro}
      onSubmit={handleSubmit}
    />
  );
}
