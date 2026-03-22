import { useState } from 'react';
import './CampoFormulario.css';

interface CampoFormularioProps {
  label: string;
  nome: string;
  tipo?: 'text' | 'email' | 'tel' | 'number' | 'password';
  valor: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  erro?: string;
  obrigatorio?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function CampoFormulario({
  label,
  nome,
  tipo = 'text',
  valor,
  onChange,
  onBlur,
  erro,
  obrigatorio = false,
  placeholder,
  maxLength,
}: CampoFormularioProps) {
  const [foiDesfocado, setFoiDesfocado] = useState(false);

  function handleBlur() {
    setFoiDesfocado(true);
    onBlur?.();
  }

  return (
    <div className={`campo-formulario ${erro && (foiDesfocado || valor) ? 'campo-formulario--erro' : ''}`}>
      <label htmlFor={nome} className="campo-formulario__label">
        {label}
        {obrigatorio && <span className="campo-formulario__obrigatorio">*</span>}
      </label>
      <input
        type={tipo}
        id={nome}
        name={nome}
        className="campo-formulario__input"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {erro && (foiDesfocado || valor) && (
        <span className="campo-formulario__erro">{erro}</span>
      )}
    </div>
  );
}
