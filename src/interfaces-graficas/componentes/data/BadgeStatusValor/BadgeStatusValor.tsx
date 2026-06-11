import styles from '@/interfaces-graficas/componentes/data/BadgeStatusValor/BadgeStatusValor.module.css';

interface BadgeStatusValorProps {
  status: string;
}

const CORES: Record<string, string> = {
  disponivel: styles.disponivel,
  alugado: styles.alugado,
  ativo: styles.ativo,
  'em atraso': styles.atraso,
  concluido: styles.concluido,
  concluído: styles.concluido,
  cancelado: styles.cancelado,
};

function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function BadgeStatusValor({ status }: BadgeStatusValorProps) {
  const className = CORES[normalizar(status)] || styles.padrao;

  return (
    <span className={`${styles.badge} ${className}`}>
      {status}
    </span>
  );
}
