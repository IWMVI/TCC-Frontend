import {LogOut} from 'lucide-react';
import {Outlet} from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
        <header className={styles.layout__header}>
            <span className={styles.layout__titulo}>Painel Administrativo – Sistema Interno</span>
            <button className={styles.layout__sair} type="button">
                <LogOut size={16} aria-hidden="true"/>
                Sair
            </button>
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