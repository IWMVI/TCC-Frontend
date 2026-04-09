import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { LoadingState } from '../../../../componentes/feedback/LoadingState';
import { atualizarTrajeUseCase, buscarTrajePorIdUseCase, TRAJE_CONSTANTS } from '@application/trajes';
import { TrajeRequest } from '@domain/entidades';

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
        const traje = await buscarTrajePorIdUseCase.executar(Number.parseInt(id, 10));
        setInitialData({
          nome: traje.nome,
          descricao: traje.descricao,
          tecido: traje.tecido,
          cor: traje.cor,
          estampa: traje.estampa,
          tipo: traje.tipoTraje,
          valorItem: traje.preco,
          tamanho: traje.tamanho,
          textura: traje.textura,
          status: traje.status,
          genero: traje.sexo,
          condicao: traje.condicao,
          imagemUrl: traje.imagem,
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
      navigate(TRAJE_CONSTANTS.ROUTES.LISTAR);
      return Number.parseInt(id, 10);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar traje');
      return 0;
    } finally {
      setEstaEnviando(false);
    }
  }

  if (estaCarregando) {
    return <LoadingState mensagem="Carregando traje..." />;
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
