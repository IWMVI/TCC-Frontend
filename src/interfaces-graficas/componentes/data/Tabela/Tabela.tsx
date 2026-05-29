import type { CSSProperties } from 'react';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import styles from '@/interfaces-graficas/componentes/data/Tabela/Tabela.module.css';

export interface Coluna<T> {
  chave: keyof T | 'acoes';
  titulo: string;
  width?: string;
  minWidth?: string;
  tipo?: 'texto' | 'numero' | 'acoes';
  render?: (item: T) => React.ReactNode;
}

function classeCelulaColuna<T>(coluna: Coluna<T>, alinharAoCentro: boolean): string | undefined {
  if (coluna.chave === 'acoes' || coluna.tipo === 'acoes') {
    return styles.tabela__td_acoes;
  }

  if (alinharAoCentro) {
    return coluna.tipo === 'texto' ? styles.tabela__td_centro_texto : styles.tabela__td_centro;
  }

  if (coluna.tipo === 'numero') {
    return styles.tabela__td_numero;
  }
  if (coluna.tipo === 'texto') {
    return styles.tabela__td_texto;
  }
  return undefined;
}

function estiloColuna<T>(coluna: Coluna<T>): CSSProperties | undefined {
  if (!coluna.width && !coluna.minWidth) {
    return undefined;
  }

  return {
    width: coluna.width,
    minWidth: coluna.minWidth ?? coluna.width,
  };
}

interface TabelaProps<T> {
  colunas: Coluna<T>[];
  dados: T[];
  chaveEstrangeira?: keyof T;
  estaCarregando?: boolean;
  linhasPorPagina?: number;
  preencherLinhas?: boolean;
  alinharAoCentro?: boolean;
}

function obterChaveLinha<T extends object>(item: T, indice: number): string {
  const id = (item as Record<string, unknown>).id;
  return id != null ? String(id) : `linha-${indice}`;
}

function isColunaStatus<T>(coluna: Coluna<T>): boolean {
  return coluna.chave === 'status' || coluna.titulo === 'Status';
}

function isColunaAcoes<T>(coluna: Coluna<T>): boolean {
  return coluna.chave === 'acoes' || coluna.tipo === 'acoes' || coluna.titulo === 'Ações';
}

function ordenarColunasTabela<T>(colunas: Coluna<T>[]): Coluna<T>[] {
  const colunasAcoes = colunas.filter(isColunaAcoes);
  const colunasStatus = colunas.filter(
    (coluna) => isColunaStatus(coluna) && !isColunaAcoes(coluna),
  );
  const demaisColunas = colunas.filter(
    (coluna) => !isColunaStatus(coluna) && !isColunaAcoes(coluna),
  );

  return [...demaisColunas, ...colunasStatus, ...colunasAcoes];
}

export function Tabela<T extends object>({
  colunas,
  dados,
  estaCarregando = false,
  linhasPorPagina = TAMANHO_PAGINA_PADRAO,
  preencherLinhas = true,
  alinharAoCentro = false,
}: TabelaProps<T>) {
  const colunasExibidas = ordenarColunasTabela(colunas);
  const classeTabelaBase = alinharAoCentro
    ? `${styles.tabela} ${styles['tabela--centro']}`
    : styles.tabela;
  const classeTabela = preencherLinhas
    ? `${classeTabelaBase} ${styles.tabela_distribuir_linhas}`
    : classeTabelaBase;
  const classeWrapper = preencherLinhas
    ? `${styles.tabela__wrapper} ${styles.tabela__wrapper_preencher}`
    : styles.tabela__wrapper;
  const registros = estaCarregando ? [] : dados;
  const exibeMensagemEstado = estaCarregando || registros.length === 0;
  const linhasDados = exibeMensagemEstado ? 0 : registros.length;
  const capacidadeLinhas = preencherLinhas ? linhasPorPagina : linhasDados;
  const linhasReservadas = Math.max(
    0,
    capacidadeLinhas - linhasDados - (exibeMensagemEstado ? 1 : 0),
  );

  return (
    <div className={classeWrapper}>
      <table className={classeTabela}>
        <thead>
          <tr>
            {colunasExibidas.map((coluna) => (
              <th
                key={String(coluna.chave)}
                className={classeCelulaColuna(coluna, alinharAoCentro)}
                style={estiloColuna(coluna)}
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {estaCarregando && (
            <tr className={styles.tabela__linha_mensagem}>
              <td colSpan={colunasExibidas.length}>Carregando dados...</td>
            </tr>
          )}

          {!estaCarregando && registros.length === 0 && (
            <tr className={styles.tabela__linha_mensagem}>
              <td colSpan={colunasExibidas.length}>Nenhum registro encontrado</td>
            </tr>
          )}

          {!estaCarregando &&
            registros.map((item, indice) => (
              <tr key={obterChaveLinha(item, indice)} className={styles.tabela__linha_dados}>
                {colunasExibidas.map((coluna) => (
                  <td
                    key={String(coluna.chave)}
                    className={classeCelulaColuna(coluna, alinharAoCentro)}
                    style={estiloColuna(coluna)}
                  >
                    {coluna.render ? (
                      coluna.chave === 'status' && alinharAoCentro ? (
                        <div className={styles.tabela__celula_badge}>{coluna.render(item)}</div>
                      ) : (
                        coluna.render(item)
                      )
                    ) : (
                      String((item as Record<string, unknown>)[coluna.chave as string] ?? '')
                    )}
                  </td>
                ))}
              </tr>
            ))}

          {Array.from({ length: linhasReservadas }, (_, indice) => (
            <tr key={`reservada-${indice}`} className={styles.tabela__linha_vazia} aria-hidden="true">
              {colunasExibidas.map((coluna) => (
                <td key={String(coluna.chave)}>&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
