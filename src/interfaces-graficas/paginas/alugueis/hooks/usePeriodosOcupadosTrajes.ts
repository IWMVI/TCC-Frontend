import { PeriodoAlugado } from '@domain/entidades';
import { ITrajeRepository } from '@domain/interfaces';
import {
  buscarPeriodosOcupadosDosTrajes,
  filtrarPeriodoDoAluguelAtual,
} from '@/interfaces-graficas/paginas/alugueis/utils/validacaoDatasAluguel';
import { useEffect, useState } from 'react';

interface UsePeriodosOcupadosTrajesParams {
  trajeIds: number[];
  trajeRepository: ITrajeRepository;
  dataRetiradaIgnorar?: string;
  dataDevolucaoIgnorar?: string;
}

export function usePeriodosOcupadosTrajes({
  trajeIds,
  trajeRepository,
  dataRetiradaIgnorar,
  dataDevolucaoIgnorar,
}: UsePeriodosOcupadosTrajesParams) {
  const [periodosOcupados, setPeriodosOcupados] = useState<PeriodoAlugado[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const idsChave = trajeIds.join(',');

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const ids = idsChave ? idsChave.split(',').map((id) => Number(id)) : [];

      if (ids.length === 0) {
        setPeriodosOcupados([]);
        setEstaCarregando(false);
        return;
      }

      setEstaCarregando(true);
      try {
        const periodos = await buscarPeriodosOcupadosDosTrajes(ids, (id) =>
          trajeRepository.buscarPeriodosAlugados(id),
        );
        if (!cancelado) {
          setPeriodosOcupados(
            filtrarPeriodoDoAluguelAtual(periodos, dataRetiradaIgnorar, dataDevolucaoIgnorar),
          );
        }
      } catch {
        if (!cancelado) {
          setPeriodosOcupados([]);
        }
      } finally {
        if (!cancelado) {
          setEstaCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      cancelado = true;
    };
  }, [idsChave, trajeRepository, dataRetiradaIgnorar, dataDevolucaoIgnorar]);

  return { periodosOcupados, estaCarregando };
}
