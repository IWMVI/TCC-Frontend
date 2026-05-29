import styles from '@/interfaces-graficas/componentes/base/BadgeStatus/BadgeStatus.module.css';
import {
  obterRotuloBadgeStatus,
  obterVarianteBadgeStatus,
  type VarianteBadgeStatus,
} from '@/interfaces-graficas/componentes/base/BadgeStatus/obterVarianteBadgeStatus';

interface BadgeStatusProps {
  children: React.ReactNode;
  variante?: VarianteBadgeStatus;
  className?: string;
}

export function BadgeStatus({
  children,
  variante = 'neutro',
  className = '',
}: Readonly<BadgeStatusProps>) {
  return (
    <span className={`${styles.badge} ${styles[`badge--${variante}`]} ${className}`.trim()}>
      {children}
    </span>
  );
}

interface BadgeStatusValorProps {
  status: string;
  className?: string;
}

export function BadgeStatusValor({ status, className }: Readonly<BadgeStatusValorProps>) {
  return (
    <BadgeStatus variante={obterVarianteBadgeStatus(status)} className={className}>
      {obterRotuloBadgeStatus(status)}
    </BadgeStatus>
  );
}
