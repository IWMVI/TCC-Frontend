import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {FormularioCliente} from '../../componentes';
import {AtualizarClienteUseCase, BuscarClientePorIdUseCase,} from '../../../../../application/clientes';
import {ClienteApiRepositorio} from '../../../../../infrastructure/api';
import {ClienteRequest,} from '../../../../../domain/entidades';
import {mascararCelular, mascararCep, mascararCpfCnpj} from '../../../../utils/formatacoes';
import styles from './EditarCliente.module.css';

const clienteRepositorio = new ClienteApiRepositorio();
const buscarClienteUseCase = new BuscarClientePorIdUseCase(clienteRepositorio);
const atualizarClienteUseCase = new AtualizarClienteUseCase(clienteRepositorio);

export function EditarCliente() {
  const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<
        Partial<ClienteRequest> & { medidas?: Record<string, number>; medidaId?: number }
    >();

  useEffect(() => {
    async function carregarCliente() {
      if (!id) return;
      try {
        const cliente = await buscarClienteUseCase.executar(parseInt(id, 10));
          const medidas = await clienteRepositorio.buscarMedidas(parseInt(id, 10));

          let medidasFormatadas: Record<string, number> = {};
          let medidaId: number | undefined;
          if (medidas) {
              const medida = medidas;
              medidaId = medida.id;
              if ('cintura' in medida) {
                  medidasFormatadas = {
                      cintura: Math.round(medida.cintura * 100),
                      manga: Math.round(medida.manga * 100),
                      ...('alturaBusto' in medida && {
                          alturaBusto: Math.round(medida.alturaBusto * 100),
                          raioBusto: Math.round(medida.raioBusto * 100),
                          corpo: Math.round(medida.corpo * 100),
                          ombro: Math.round(medida.ombro * 100),
                          decote: Math.round(medida.decote * 100),
                          quadril: Math.round(medida.quadril * 100),
                          comprimentoVestido: Math.round(medida.comprimentoVestido * 100),
                      }),
                      ...('colarinho' in medida && {
                          colarinho: Math.round(medida.colarinho * 100),
                          barra: Math.round(medida.barra * 100),
                          torax: Math.round(medida.torax * 100),
                      }),
                  };
              }
          }

        setInitialData({
          nome: cliente.nome,
          cpfCnpj: mascararCpfCnpj(cliente.cpfCnpj),
          email: cliente.email,
          celular: mascararCelular(cliente.celular),
            sexo:
                cliente.sexo === 'MASCULINO' || cliente.sexo === 'FEMININO' ? cliente.sexo : undefined,
          endereco: {
            cep: mascararCep(cliente.endereco.cep),
            logradouro: cliente.endereco.logradouro,
            numero: cliente.endereco.numero,
            bairro: cliente.endereco.bairro,
            cidade: cliente.endereco.cidade,
            estado: cliente.endereco.estado,
            complemento: cliente.endereco.complemento || '',
          },
            medidas: medidasFormatadas,
            medidaId,
        });
      } catch {
        setErro('Cliente não encontrado');
      } finally {
        setEstaCarregando(false);
      }
    }
    carregarCliente();
  }, [id]);

    async function handleSubmit(dados: ClienteRequest): Promise<void> {
    if (!id) return;
    setErro(null);
    setEstaEnviando(true);

    try {
      await atualizarClienteUseCase.executar(parseInt(id, 10), dados);
        navigate('/clientes/listar');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
    } finally {
      setEstaEnviando(false);
    }
  }

  if (estaCarregando) {
    return (
      <div className={styles['formulario-cliente']}>
        <p className={styles['formulario-cliente__carregando']}>Carregando...</p>
      </div>
    );
  }

  return (
    <FormularioCliente
      titulo="Editar Cliente"
      initialData={initialData}
      estaEnviando={estaEnviando}
      erro={erro}
      onSubmit={handleSubmit}
      clienteId={id ? parseInt(id, 10) : undefined}
    />
  );
}
