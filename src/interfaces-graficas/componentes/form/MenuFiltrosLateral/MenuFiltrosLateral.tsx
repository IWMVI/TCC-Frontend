import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from '@/interfaces-graficas/componentes/form/MenuFiltrosLateral/MenuFiltrosLateral.module.css';

interface MenuFiltrosLateralProps {
  aberto: boolean;
  onFechar: () => void;
  titulo?: string;
  children: React.ReactNode;
}

export function MenuFiltrosLateral({
  aberto,
  onFechar,
  titulo = 'Filtros',
  children,
}: Readonly<MenuFiltrosLateralProps>) {
  useEffect(() => {
    if (!aberto) {
      return;
    }

    function handleTecla(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onFechar();
      }
    }

    document.addEventListener('keydown', handleTecla);
    return () => document.removeEventListener('keydown', handleTecla);
  }, [aberto, onFechar]);

  if (!aberto) {
    return null;
  }

  return (
    <div className={styles.menu_filtros} role="presentation">
      <button
        type="button"
        className={styles.menu_filtros__overlay}
        onClick={onFechar}
        aria-label="Fechar filtros"
      />
      <aside
        className={styles.menu_filtros__painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-filtros-titulo"
      >
        <header className={styles.menu_filtros__cabecalho}>
          <h2 id="menu-filtros-titulo" className={styles.menu_filtros__titulo}>
            {titulo}
          </h2>
          <button
            type="button"
            className={styles.menu_filtros__fechar}
            onClick={onFechar}
            aria-label="Fechar painel de filtros"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.menu_filtros__corpo}>{children}</div>
      </aside>
    </div>
  );
}
