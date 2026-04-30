import {Outlet} from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
        <header className={styles.layout__header}>
            <span className={styles.layout__titulo}>Painel Administrativo – Sistema Interno</span>
        </header>

        <main className={styles.layout__conteudo}>
            <Outlet/>
        </main>

        <footer className={styles.layout__footer}>
            <span>© 2025 Sistema Interno</span>
        </footer>
    </div>
  );
}