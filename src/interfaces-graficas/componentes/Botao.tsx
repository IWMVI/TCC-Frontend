import './Botao.css';

interface BotaoProps {
  children: React.ReactNode;
  tipo?: 'primario' | 'secundario' | 'perigo';
  tipoHtml?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Botao({
  children,
  tipo = 'primario',
  tipoHtml = 'button',
  disabled = false,
  onClick,
  className = '',
}: BotaoProps) {
  return (
    <button
      type={tipoHtml}
      className={`botao botao--${tipo} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
