import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Paginacao.module.css';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
  onPageChange: (pagina: number) => void;
  onTamanhoChange?: (tamanho: number) => void;
  mostrarSeletorTamanho?: boolean;
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  totalRegistros,
  tamanhoPagina,
  onPageChange,
  onTamanhoChange,
  mostrarSeletorTamanho = false,
}: PaginacaoProps) {
  const inicio = totalRegistros === 0 ? 0 : paginaAtual * tamanhoPagina + 1;
  const fim = Math.min((paginaAtual + 1) * tamanhoPagina, totalRegistros);

  // Se não há registros ou apenas uma página, mostra apenas info
  if (totalPaginas <= 1 && totalRegistros === 0) {
    return (
      <div className={styles.paginacao}>
        <div className={styles.paginacao__info}>
          Nenhum registro encontrado
        </div>
      </div>
    );
  }

  function gerarNumerosPagina(): (number | string)[] {
    const numeros: (number | string)[] = [];
    const maxVisiveis = 5;

    if (totalPaginas <= maxVisiveis) {
      for (let i = 0; i < totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaAtual < 3) {
        for (let i = 0; i < 4; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas - 1);
      } else if (paginaAtual >= totalPaginas - 3) {
        numeros.push(0);
        numeros.push('...');
        for (let i = totalPaginas - 4; i < totalPaginas; i++) numeros.push(i);
      } else {
        numeros.push(0);
        numeros.push('...');
        for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) numeros.push(i);
        numeros.push('...');
        numeros.push(totalPaginas - 1);
      }
    }

    return numeros;
  }

  return (
    <div className={styles.paginacao}>
      <div className={styles.paginacao__info}>
        Mostrando {inicio} a {fim} de {totalRegistros} registros
        {mostrarSeletorTamanho && onTamanhoChange && (
          <select
            className={styles['paginacao__seletor-tamanho']}
            value={tamanhoPagina.toString()}
            onChange={(e) => onTamanhoChange(Number(e.target.value))}
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className={styles.paginacao__controles}>
          <button
            type="button"
            className={styles.paginacao__botao}
            onClick={() => onPageChange(0)}
            disabled={paginaAtual === 0}
            title="Primeira página"
            aria-label="Primeira página"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className={styles.paginacao__botao}
            onClick={() => onPageChange(paginaAtual - 1)}
            disabled={paginaAtual === 0}
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {gerarNumerosPagina().map((num, index) =>
            typeof num === 'number' ? (
              <button
                key={index}
                type="button"
                className={`${styles.paginacao__botao} ${num === paginaAtual ? styles['paginacao__botao--ativo'] : ''}`}
                onClick={() => onPageChange(num)}
                aria-label={`Página ${num + 1}`}
                aria-current={num === paginaAtual ? 'page' : undefined}
              >
                {num + 1}
              </button>
            ) : (
              <span key={index} className={styles.paginacao__botao}>
                {num}
              </span>
            )
          )}

          <button
            type="button"
            className={styles.paginacao__botao}
            onClick={() => onPageChange(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas - 1}
            title="Próxima página"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className={styles.paginacao__botao}
            onClick={() => onPageChange(totalPaginas - 1)}
            disabled={paginaAtual === totalPaginas - 1}
            title="Última página"
            aria-label="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
