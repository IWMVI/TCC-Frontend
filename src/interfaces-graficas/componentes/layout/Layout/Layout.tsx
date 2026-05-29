import { Outlet, useNavigate } from 'react-router-dom';
import { useTema } from '@/interfaces-graficas/contextos/ContextoTema';
import { useAutenticacao } from '@/interfaces-graficas/contextos/ContextoAutenticacao';
import {
  ProvedorMenuLateral,
  useMenuLateral,
} from '@/interfaces-graficas/contextos/ContextoMenuLateral';
import { MenuLateral } from '@/interfaces-graficas/componentes/layout/MenuLateral';
import { LogOut, Moon, Sun } from 'lucide-react';
import styles from '@/interfaces-graficas/componentes/layout/Layout/Layout.module.css';

function LayoutInterno() {
  const { tema, alternarTema } = useTema();
  const { funcionario, logout } = useAutenticacao();
  const { expandido } = useMenuLateral();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div
      className={styles.layout}
      data-menu-expandido={expandido ? 'true' : 'false'}
    >
      <header className={styles.layout__header}>
        <div className={styles.layout__acoes_esquerda}>
          {funcionario && (
            <span className={styles.layout__usuario} title={funcionario.email}>
              {funcionario.nome}
            </span>
          )}
        </div>
        <span className={styles.layout__titulo}>Painel Administrativo – Sistema Interno</span>
        <div className={styles.layout__acoes}>
          <button
            onClick={alternarTema}
            className={styles.layout__tema_botao}
            aria-label="Alternar tema"
            type="button"
          >
            {tema === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            className={styles.layout__sair}
            onClick={handleLogout}
            aria-label="Sair do sistema"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className={styles.layout__corpo}>
        <MenuLateral />
        <main className={styles.layout__conteudo}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.layout__footer}>
        <span>© 2025 Sistema Interno</span>
      </footer>
    </div>
  );
}

export function Layout() {
  return (
    <ProvedorMenuLateral>
      <LayoutInterno />
    </ProvedorMenuLateral>
  );
}
