import styles from './Tabela.module.css';

interface Coluna<T> {
  chave: keyof T | 'acoes';
  titulo: string;
  render?: (item: T) => React.ReactNode;
}

interface TabelaProps<T> {
  colunas: Coluna<T>[];
  dados: T[];
  chaveEstrangeira?: keyof T;
  estaCarregando?: boolean;
}

export function Tabela<T extends object>({
  colunas,
  dados,
  estaCarregando = false,
}: TabelaProps<T>) {
  if (estaCarregando) {
    return (
      <div className={styles.tabela__carregando}>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <div className={styles.tabela__vazia}>
        <p>Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.tabela__wrapper}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={String(coluna.chave)}>{coluna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item, indice) => (
            <tr key={indice}>
              {colunas.map((coluna) => (
                <td key={String(coluna.chave)}>
                  {coluna.render
                    ? coluna.render(item)
                    : String((item as Record<string, unknown>)[coluna.chave as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
