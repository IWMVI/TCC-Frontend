import './Busca.css';

interface BuscaProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  onSearch?: (valor: string) => void;
}

export function Busca({
  valor,
  onChange,
  placeholder = 'Buscar...',
  onSearch,
}: BuscaProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && onSearch) {
      onSearch(valor);
    }
  }

  return (
    <div className={`busca ${valor ? 'busca--ativa' : ''}`}>
      <span className="busca__icone">🔍</span>
      <input
        type="text"
        className="busca__input"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {valor && (
        <button
          type="button"
          className="busca__botao-limpar"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  );
}
