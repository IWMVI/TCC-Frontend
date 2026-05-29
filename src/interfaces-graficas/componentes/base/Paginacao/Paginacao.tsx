import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TAMANHO_PAGINA_PADRAO } from '@domain/constants/paginacao';
import styles from '@/interfaces-graficas/componentes/base/Paginacao/Paginacao.module.css';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina?: number;
  onPageChange: (pagina: number) => void;
  onTamanhoChange?: (tamanho: number) => void;
  mostrarSeletorTamanho?: boolean;
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  tamanhoPagina = TAMANHO_PAGINA_PADRAO,
  onPageChange,
  onTamanhoChange,
  mostrarSeletorTamanho = false,
}: PaginacaoProps) {
  const totalPaginasEfetivo = Math.max(totalPaginas, 1);
  const paginaAtualSegura = Math.min(Math.max(paginaAtual, 0), totalPaginasEfetivo - 1);
  const inicio = totalRegistros === 0 ? 0 : paginaAtualSegura * tamanhoPagina + 1;
  const fim = totalRegistros === 0 ? 0 : Math.min((paginaAtualSegura + 1) * tamanhoPagina, totalRegistros);

  function gerarNumerosPagina(): (number | string)[] {
    const numeros: (number | string)[] = [];
    const maxVisiveis = 5;

    if (totalPaginasEfetivo <= maxVisiveis) {
      for (let i = 0; i < totalPaginasEfetivo; i++) {
        numeros.push(i);
      }
    } else if (paginaAtualSegura < 3) {
      for (let i = 0; i < 4; i++) numeros.push(i);
      numeros.push('...');
      numeros.push(totalPaginasEfetivo - 1);
    } else if (paginaAtualSegura >= totalPaginasEfetivo - 3) {
      numeros.push(0);
      numeros.push('...');
      for (let i = totalPaginasEfetivo - 4; i < totalPaginasEfetivo; i++) numeros.push(i);
    } else {
      numeros.push(0);
      numeros.push('...');
      for (let i = paginaAtualSegura - 1; i <= paginaAtualSegura + 1; i++) numeros.push(i);
      numeros.push('...');
      numeros.push(totalPaginasEfetivo - 1);
    }

    return numeros;
  }

  const textoInfo =
    totalRegistros === 0
      ? `Nenhum registro encontrado \u00b7 ${tamanhoPagina} itens por p\u00e1gina`
      : `Mostrando ${inicio} a ${fim} de ${totalRegistros} registros \u00b7 ${tamanhoPagina} itens por p\u00e1gina`;

  return (
    <div className={styles.paginacao}>
      <div className={styles.paginacao__info}>
        {textoInfo}
        {mostrarSeletorTamanho && onTamanhoChange && (
          <select
            className={styles['paginacao__seletor-tamanho']}
            value={tamanhoPagina.toString()}
            onChange={(e) => onTamanhoChange(Number(e.target.value))}
          >
            <option value={5}>5 por p?gina</option>
            <option value={10}>10 por p?gina</option>
            <option value={25}>25 por p?gina</option>
            <option value={50}>50 por p?gina</option>
          </select>
        )}
      </div>

      <div className={styles.paginacao__controles}>
        <button
          type="button"
          className={styles.paginacao__botao}
          onClick={() => onPageChange(0)}
          disabled={paginaAtualSegura === 0}
          title="Primeira p?gina"
          aria-label="Primeira p?gina"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          className={styles.paginacao__botao}
          onClick={() => onPageChange(paginaAtualSegura - 1)}
          disabled={paginaAtualSegura === 0}
          title="P?gina anterior"
          aria-label="P?gina anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {gerarNumerosPagina().map((num, index) =>
          typeof num === 'number' ? (
            <button
              key={index}
              type="button"
              className={`${styles.paginacao__botao} ${num === paginaAtualSegura ? styles['paginacao__botao--ativo'] : ''}`}
              onClick={() => onPageChange(num)}
              aria-label={`P?gina ${num + 1}`}
              aria-current={num === paginaAtualSegura ? 'page' : undefined}
            >
              {num + 1}
            </button>
          ) : (
            <span key={index} className={styles.paginacao__botao}>
              {num}
            </span>
          ),
        )}

        <button
          type="button"
          className={styles.paginacao__botao}
          onClick={() => onPageChange(paginaAtualSegura + 1)}
          disabled={paginaAtualSegura >= totalPaginasEfetivo - 1}
          title="Pr?xima p?gina"
          aria-label="Pr?xima p?gina"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          className={styles.paginacao__botao}
          onClick={() => onPageChange(totalPaginasEfetivo - 1)}
          disabled={paginaAtualSegura >= totalPaginasEfetivo - 1}
          title="?ltima p?gina"
          aria-label="?ltima p?gina"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
