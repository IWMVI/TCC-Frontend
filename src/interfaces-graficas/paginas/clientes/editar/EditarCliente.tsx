import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormularioCliente } from '../componentes';
import { BuscarClientePorIdUseCase, AtualizarClienteUseCase } from '../../../../application/clientes';
import { ClienteApiRepositorio } from '../../../../infrastructure/api';
import { ClienteRequest } from '../../../../domain/entidades';
import { mascararCpfCnpj, mascararCelular, mascararCep } from '../../../utils/formatacoes';

const clienteRepositorio = new ClienteApiRepositorio();
const buscarClienteUseCase = new BuscarClientePorIdUseCase(clienteRepositorio);
const atualizarClienteUseCase = new AtualizarClienteUseCase(clienteRepositorio);

export function EditarCliente() {
  const { id } = useParams<{ id: string }>();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<ClienteRequest>>();

  useEffect(() => {
    async function carregarCliente() {
      if (!id) return;
      try {
        const cliente = await buscarClienteUseCase.executar(parseInt(id, 10));
        setInitialData({
          nome: cliente.nome,
          cpfCnpj: mascararCpfCnpj(cliente.cpfCnpj),
          email: cliente.email,
          celular: mascararCelular(cliente.celular),
          endereco: {
            cep: mascararCep(cliente.endereco.cep),
            logradouro: cliente.endereco.logradouro,
            numero: cliente.endereco.numero,
            bairro: cliente.endereco.bairro,
            cidade: cliente.endereco.cidade,
            estado: cliente.endereco.estado,
            complemento: cliente.endereco.complemento || '',
          },
        });
      } catch {
        setErro('Cliente não encontrado');
      } finally {
        setEstaCarregando(false);
      }
    }
    carregarCliente();
  }, [id]);

  async function handleSubmit(dados: ClienteRequest) {
    if (!id) return;
    setErro(null);
    setEstaEnviando(true);

    try {
      await atualizarClienteUseCase.executar(parseInt(id, 10), dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
    } finally {
      setEstaEnviando(false);
    }
  }

  if (estaCarregando) {
    return (
      <div className="formulario-cliente">
        <p className="formulario-cliente__carregando">Carregando...</p>
      </div>
    );
  }

  return (
    <FormularioCliente
      titulo="Editar Cliente"
      descricao="Atualize os dados do cliente"
      initialData={initialData}
      estaEnviando={estaEnviando}
      erro={erro}
      onSubmit={handleSubmit}
    />
  );
}
