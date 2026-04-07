import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { AtualizarTrajeUseCase, BuscarTrajePorIdUseCase } from '@application/trajes';
import { TrajeApiRepository } from '@infrastructure/api';
import { TrajeRequest } from '@domain/entidades';
import styles from './EditarTraje.module.css';

const trajeRepositorio = new TrajeApiRepository();
const buscarTrajeUseCase = new BuscarTrajePorIdUseCase(trajeRepositorio);
const atualizarTrajeUseCase = new AtualizarTrajeUseCase(trajeRepositorio);

// TODO: mudar as propriedades do traje depois para o que foi definido no prototipo HI-FI, e o formulário irá ser atualizado para refletir essas mudanças.

export function EditarTraje() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<TrajeRequest>>();

  useEffect(() => {
    async function carregarTraje() {
      if (!id) return;
      try {
        const traje = await buscarTrajeUseCase.executar(Number.parseInt(id, 10));
        setInitialData({
          nome: traje.nome,
          descricao: traje.descricao,
          tamanho: traje.tamanho,
          cor: traje.cor,
          preco: traje.preco,
        });
      } catch {
        setErro('Traje não encontrado');
      } finally {
        setEstaCarregando(false);
      }
    }

    carregarTraje();
  }, [id]);

  async function handleSubmit(dados: TrajeRequest): Promise<number> {
    if (!id) return 0;

    setErro(null);
    setEstaEnviando(true);
    try {
      await atualizarTrajeUseCase.executar(Number.parseInt(id, 10), dados);
      navigate('/trajes/listar');
      return Number.parseInt(id, 10);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar traje');
      return 0;
    } finally {
      setEstaEnviando(false);
    }
  }

  if (estaCarregando) {
    return (
      <div className={styles['formulario-traje']}>
        <p className={styles['formulario-traje__carregando']}>Carregando...</p>
      </div>
    );
  }

  return (
    <FormularioTraje
      titulo="Editar Traje"
      trajeInicial={initialData}
      estaEnviando={estaEnviando}
      erro={erro}
      onSubmit={handleSubmit}
    />
  );
}
