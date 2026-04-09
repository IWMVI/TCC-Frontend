import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormularioTraje } from '../../componentes';
import { LoadingState } from '../../../../componentes/feedback/LoadingState';
import { atualizarTrajeUseCase, buscarTrajePorIdUseCase, TRAJE_CONSTANTS, trajeRepository } from '@application/trajes';
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
          tipo: traje.tipo,
          valorItem: traje.preco,
          tamanho: traje.tamanho,
          textura: traje.textura,
          status: traje.status,
          genero: traje.genero,
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
      const temImagemNova = dados.imagemUrl && dados.imagemUrl.startsWith('data:');
      const dadosSemImagem = {
        ...dados,
        imagemUrl: temImagemNova ? '' : (dados.imagemUrl || ''),
      };
      
      await atualizarTrajeUseCase.executar(Number.parseInt(id, 10), dadosSemImagem);
      
      if (temImagemNova) {
        const base64 = dados.imagemUrl.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], 'imagem.jpg', { type: 'image/jpeg' });
        
        await trajeRepository.atualizarImagem(Number.parseInt(id, 10), file);
      }
      
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
