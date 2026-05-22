import { PeriodoAlugado } from '@domain/entidades';
import { normalizarDataIso } from '@domain/utils/dataIso';

export function normalizarPeriodosAlugados(periodos: PeriodoAlugado[]): PeriodoAlugado[] {
  return periodos.map((periodo) => ({
    dataRetirada: normalizarDataIso(periodo.dataRetirada),
    dataDevolucao: normalizarDataIso(periodo.dataDevolucao),
  }));
}

export function periodosConflitam(
  dataRetirada: string,
  dataDevolucao: string,
  periodos: PeriodoAlugado[],
): boolean {
  return periodos.some(
    (periodo) => dataRetirada <= periodo.dataDevolucao && dataDevolucao >= periodo.dataRetirada,
  );
}

export function dataDentroDePeriodoReservado(data: string, periodos: PeriodoAlugado[]): boolean {
  return periodos.some(
    (periodo) => data >= periodo.dataRetirada && data <= periodo.dataDevolucao,
  );
}

export function dataRetiradaIndisponivel(data: string, periodos: PeriodoAlugado[]): boolean {
  return dataDentroDePeriodoReservado(data, periodos);
}

export function dataDevolucaoComConflitoReserva(
  dataRetirada: string,
  dataDevolucao: string,
  periodos: PeriodoAlugado[],
): boolean {
  if (!dataRetirada || !dataDevolucao) {
    return false;
  }
  return periodosConflitam(dataRetirada, dataDevolucao, periodos);
}

export function dataDevolucaoIndisponivel(
  dataRetirada: string,
  dataDevolucao: string,
  periodos: PeriodoAlugado[],
): boolean {
  if (!dataRetirada || !dataDevolucao) {
    return false;
  }
  if (dataDevolucao <= dataRetirada) {
    return true;
  }
  return dataDevolucaoComConflitoReserva(dataRetirada, dataDevolucao, periodos);
}

export function diaSeguinte(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  data.setDate(data.getDate() + 1);
  const mesFormatado = String(data.getMonth() + 1).padStart(2, '0');
  const diaFormatado = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mesFormatado}-${diaFormatado}`;
}

export function filtrarPeriodoDoAluguelAtual(
  periodos: PeriodoAlugado[],
  dataRetiradaAtual?: string,
  dataDevolucaoAtual?: string,
): PeriodoAlugado[] {
  if (!dataRetiradaAtual || !dataDevolucaoAtual) {
    return periodos;
  }
  return periodos.filter(
    (periodo) =>
      !(
        periodo.dataRetirada === dataRetiradaAtual &&
        periodo.dataDevolucao === dataDevolucaoAtual
      ),
  );
}

export async function buscarPeriodosOcupadosDosTrajes(
  trajeIds: number[],
  buscarPeriodos: (trajeId: number) => Promise<PeriodoAlugado[]>,
): Promise<PeriodoAlugado[]> {
  if (trajeIds.length === 0) {
    return [];
  }

  const resultados = await Promise.allSettled(trajeIds.map((id) => buscarPeriodos(id)));
  return resultados.flatMap((resultado) =>
    resultado.status === 'fulfilled' ? normalizarPeriodosAlugados(resultado.value) : [],
  );
}
