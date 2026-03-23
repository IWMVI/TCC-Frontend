import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  const localizacao = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const estaAtivo = (caminho: string) => {
    return localizacao.pathname.startsWith(caminho) ? 'ativo' : '';
  };

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.layout__sidebar} ${menuAberto ? styles['layout__sidebar--aberto'] : ''}`}
      >
        <div className={styles.layout__logo}>
          <h1>TCC</h1>
          <span>Sistema de Locação</span>
        </div>
        <nav className={styles.layout__nav}>
          <Link
            to="/dashboard"
            className={`${styles.layout__link} ${estaAtivo('/dashboard')}`}
            onClick={fecharMenu}
          >
            <span className={styles.layout__icone}>📊</span>
            Dashboard
          </Link>
          <Link
            to="/clientes"
            className={`${styles.layout__link} ${estaAtivo('/clientes')}`}
            onClick={fecharMenu}
          >
            <span className={styles.layout__icone}>👥</span>
            Clientes
          </Link>
          <Link
            to="/trajes"
            className={`${styles.layout__link} ${estaAtivo('/trajes')}`}
            onClick={fecharMenu}
          >
            <span className={styles.layout__icone}>👔</span>
            Trajes
          </Link>
          <Link
            to="/alugueis"
            className={`${styles.layout__link} ${estaAtivo('/alugueis')}`}
            onClick={fecharMenu}
          >
            <span className={styles.layout__icone}>📋</span>
            Aluguéis
          </Link>
        </nav>
      </aside>
      {menuAberto && <div className={styles.layout__overlay} onClick={fecharMenu} />}
      <div className={styles.layout__principal}>
        <header className={styles.layout__header}>
          <button className={styles['layout__menu-toggle']} onClick={toggleMenu} aria-label="Menu">
            <span className={styles['layout__menu-icone']}>{menuAberto ? '✕' : '☰'}</span>
          </button>
        </header>
        <main className={styles.layout__conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
