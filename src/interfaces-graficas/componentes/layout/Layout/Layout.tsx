import {Outlet} from 'react-router-dom';
import { useTema } from '../../../contextos/ContextoTema';
import { Moon, Sun } from 'lucide-react';
import styles from './Layout.module.css';

export function Layout() {
  const { tema, alternarTema } = useTema();

  return (
    <div className={styles.layout}>
        <header className={styles.layout__header}>
            <span className={styles.layout__titulo}>Painel Administrativo – Sistema Interno</span>
              <button
               onClick={alternarTema}
               className={styles.layout__tema_botao}
               aria-label="Alternar tema"
             >
               {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
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