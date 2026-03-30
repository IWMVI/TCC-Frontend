import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {FormularioCliente} from '../../componentes';
import {AtualizarClienteUseCase, BuscarClientePorIdUseCase} from '@application/clientes';
import {ClienteApiRepository} from '@infrastructure/api';
import {ClienteRequest, Endereco, MedidaFemininaResponse, MedidaMasculinaResponse} from '@domain/entidades';
import {mascararCelular, mascararCep, mascararCpfCnpj} from '../../../../utils/formatacoes';
import styles from './EditarCliente.module.css';

const clienteRepositorio = new ClienteApiRepository();
const buscarClienteUseCase = new BuscarClientePorIdUseCase(clienteRepositorio);
const atualizarClienteUseCase = new AtualizarClienteUseCase(clienteRepositorio);

function normalizarSexo(sexo?: string): 'MASCULINO' | 'FEMININO' | 'NEUTRO' | undefined {
    return sexo === 'MASCULINO' || sexo === 'FEMININO' || sexo === 'NEUTRO' ? sexo : undefined;
}

function formatarEndereco(endereco: Endereco) {
    return {
        cep: mascararCep(endereco.cep),
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        complemento: endereco.complemento || '',
    };
}

function buscarDadosMedidas(medidas: MedidaFemininaResponse[] | MedidaMasculinaResponse[] | null) {
    if (!medidas || medidas.length === 0)
        return {medidas: {} as Record<string, number>, medidaId: undefined};
    
    const medidasFormatadas: Record<string, number> = {};
    let medidaId: number | undefined;

    // Para pessoa jurídica, podemos ter múltiplas medidas (feminina e masculina)
    // Precisamos mesclar todas as medidas
    medidas.forEach((medida, index) => {
        // Adiciona cintura e manga (comuns a ambos)
        medidasFormatadas.cintura = Math.round(medida.cintura * 100);
        medidasFormatadas.manga = Math.round(medida.manga * 100);

        // Adiciona campos femininos se existirem
        if ('alturaBusto' in medida) {
            medidasFormatadas.alturaBusto = Math.round(medida.alturaBusto * 100);
            medidasFormatadas.raioBusto = Math.round(medida.raioBusto * 100);
            medidasFormatadas.corpo = Math.round(medida.corpo * 100);
            medidasFormatadas.ombro = Math.round(medida.ombro * 100);
            medidasFormatadas.decote = Math.round(medida.decote * 100);
            medidasFormatadas.quadril = Math.round(medida.quadril * 100);
            medidasFormatadas.comprimentoVestido = Math.round(medida.comprimentoVestido * 100);
        }

        // Adiciona campos masculinos se existirem
        if ('colarinho' in medida) {
            medidasFormatadas.colarinho = Math.round(medida.colarinho * 100);
            medidasFormatadas.barra = Math.round(medida.barra * 100);
            medidasFormatadas.torax = Math.round(medida.torax * 100);
        }

        // Usa o ID da primeira medida como referência
        if (index === 0) {
            medidaId = medida.id;
        }
    });

    return {medidas: medidasFormatadas, medidaId};
}

export function EditarCliente() {
    const {id} = useParams<{ id: string }>();
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
                const cliente = await buscarClienteUseCase.executar(Number.parseInt(id, 10));
                const medidas = await clienteRepositorio.buscarMedidas(Number.parseInt(id, 10));
                const dadosMedidas = buscarDadosMedidas(medidas);

                setInitialData({
                    nome: cliente.nome,
                    cpfCnpj: mascararCpfCnpj(cliente.cpfCnpj),
                    email: cliente.email,
                    celular: mascararCelular(cliente.celular),
                    sexo: normalizarSexo(cliente.sexo),
                    endereco: formatarEndereco(cliente.endereco),
                    medidas: dadosMedidas.medidas,
                    medidaId: dadosMedidas.medidaId,
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
            await atualizarClienteUseCase.executar(Number.parseInt(id, 10), dados);
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
            clienteId={id ? Number.parseInt(id, 10) : undefined}
        />
    );
}
