import { Botao } from '@/interfaces-graficas/componentes/base/Botao';
import styles from '@/interfaces-graficas/componentes/form/PainelFiltro/PainelFiltro.module.css';

interface PainelFiltroProps {
  children: React.ReactNode;
  variante?: 'inline' | 'lateral';
}

export function PainelFiltro({ children, variante = 'inline' }: Readonly<PainelFiltroProps>) {
  const classePainel =
    variante === 'lateral' ? `${styles.painel} ${styles['painel--lateral']}` : styles.painel;

  return <div className={classePainel}>{children}</div>;
}

interface PainelFiltroControlesProps {
  children: React.ReactNode;
}

export function PainelFiltroControles({ children }: Readonly<PainelFiltroControlesProps>) {
  return <div className={styles.controles}>{children}</div>;
}

interface PainelFiltroCampoProps {
  id?: string;
  label?: string;
  children: React.ReactNode;
}

export function PainelFiltroCampo({ id, label, children }: Readonly<PainelFiltroCampoProps>) {
  return (
    <div className={styles.campo}>
      {label && <label htmlFor={id}>{label}</label>}
      {children}
    </div>
  );
}

type PainelFiltroInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PainelFiltroInput({ className, ...props }: PainelFiltroInputProps) {
  const classes = className ? `${styles.input} ${className}` : styles.input;
  return <input {...props} className={classes} />;
}

type PainelFiltroSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function PainelFiltroSelect({ className, ...props }: PainelFiltroSelectProps) {
  const classes = className ? `${styles.select} ${className}` : styles.select;
  return <select {...props} className={classes} />;
}

interface PainelFiltroAcoesProps {
  onBuscar: () => void;
  onLimpar: () => void;
  carregando?: boolean;
  textoBuscar?: string;
  textoLimpar?: string;
}

export function PainelFiltroAcoes({
  onBuscar,
  onLimpar,
  carregando = false,
  textoBuscar = 'Buscar',
  textoLimpar = 'Limpar Filtros',
}: Readonly<PainelFiltroAcoesProps>) {
  return (
    <div className={styles.acoes}>
      <Botao tipo="primario" onClick={onBuscar} disabled={carregando}>
        {textoBuscar}
      </Botao>
      <Botao tipo="secundario" onClick={onLimpar} disabled={carregando}>
        {textoLimpar}
      </Botao>
    </div>
  );
}
