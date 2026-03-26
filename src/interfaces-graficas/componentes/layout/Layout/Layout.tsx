import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  const localizacao = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const estaAtivo = (caminho: string) => {
    return localizacao.pathname.startsWith(caminho) ? styles.ativo : '';
  };

  return (
    <div className={styles.layout}>
      <div className={styles.layout__principal}>
        <header className={styles.layout__header}>
          
          {/* MENU EM FORMATO DE CARDS */}
          <div className={styles.menu}>
            <Link
              to="/dashboard"
              className={`${styles.menuCard} ${estaAtivo('/dashboard')}`}
            >
              <span className={styles.icon}>📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/clientes"
              className={`${styles.menuCard} ${estaAtivo('/clientes')}`}
            >
              <span className={styles.icon}>👥</span>
              <span>Clientes</span>
            </Link>

            <Link
              to="/trajes"
              className={`${styles.menuCard} ${estaAtivo('/trajes')}`}
            >
              <span className={styles.icon}>👔</span>
              <span>Trajes</span>
            </Link>

            <Link
              to="/alugueis"
              className={`${styles.menuCard} ${estaAtivo('/alugueis')}`}
            >
              <span className={styles.icon}>📋</span>
              <span>Aluguéis</span>
            </Link>
          </div>
        </header>

        <main className={styles.layout__conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}