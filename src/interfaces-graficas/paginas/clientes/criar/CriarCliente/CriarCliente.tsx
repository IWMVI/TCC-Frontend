import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioCliente } from '../../componentes';
import { CriarClienteUseCase } from '../../../../../application/clientes';
import { ClienteApiRepositorio } from '../../../../../infrastructure/api';
import { ClienteRequest } from '../../../../../domain/entidades';

const clienteRepositorio = new ClienteApiRepositorio();
const criarClienteUseCase = new CriarClienteUseCase(clienteRepositorio);

export function CriarCliente() {
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(dados: ClienteRequest) {
    setErro(null);
    setEstaEnviando(true);

    try {
      await criarClienteUseCase.executar(dados);
      navigate('/clientes');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar cliente');
    } finally {
      setEstaEnviando(false);
    }
  }

  return (
    <FormularioCliente
      titulo="Novo Cliente"
      descricao="Cadastre um novo cliente no sistema"
      estaEnviando={estaEnviando}
      erro={erro}
      onSubmit={handleSubmit}
    />
  );
}
