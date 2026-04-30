import styles from './Tabela.module.css';

export interface Coluna<T> {
  chave: keyof T | 'acoes';
  titulo: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
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
              <th
                key={String(coluna.chave)}
                style={{
                  ...(coluna.width ? { width: coluna.width } : {}),
                  ...(coluna.align ? { textAlign: coluna.align } : {}),
                }}
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={(item as Record<string, unknown>).id as string}>
              {colunas.map((coluna) => (
                <td
                  key={String(coluna.chave)}
                  className={coluna.chave === 'acoes' ? styles.tabela__td_acoes : undefined}
                  style={coluna.align ? { textAlign: coluna.align } : undefined}
                >
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
