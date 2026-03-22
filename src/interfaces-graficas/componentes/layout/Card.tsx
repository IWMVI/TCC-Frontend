import './Card.css';

interface CardProps {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ titulo, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      <div className="card__header">
        <h2 className="card__titulo">{titulo}</h2>
      </div>
      <div className="card__corpo">{children}</div>
    </div>
  );
}
