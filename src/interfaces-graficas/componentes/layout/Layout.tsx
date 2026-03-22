import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

export function Layout() {
  const localizacao = useLocation();

  const estaAtivo = (caminho: string) => {
    return localizacao.pathname.startsWith(caminho) ? 'ativo' : '';
  };

  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <div className="layout__logo">
          <h1>TCC</h1>
          <span>Sistema de Locação</span>
        </div>
        <nav className="layout__nav">
          <Link to="/dashboard" className={`layout__link ${estaAtivo('/dashboard')}`}>
            <span className="layout__icone">📊</span>
            Dashboard
          </Link>
          <Link to="/clientes" className={`layout__link ${estaAtivo('/clientes')}`}>
            <span className="layout__icone">👥</span>
            Clientes
          </Link>
          <Link to="/trajes" className={`layout__link ${estaAtivo('/trajes')}`}>
            <span className="layout__icone">👔</span>
            Trajes
          </Link>
          <Link to="/alugueis" className={`layout__link ${estaAtivo('/alugueis')}`}>
            <span className="layout__icone">📋</span>
            Aluguéis
          </Link>
        </nav>
      </aside>
      <main className="layout__conteudo">
        <Outlet />
      </main>
    </div>
  );
}
