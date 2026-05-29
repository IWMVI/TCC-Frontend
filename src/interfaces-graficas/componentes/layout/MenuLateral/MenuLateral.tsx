import { useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  MENU_LATERAL,
  secaoMenuAtiva,
  subitemMenuAtivo,
  type ItemMenuLateral,
  type SubitemMenuLateral,
} from '@/interfaces-graficas/config/menuLateral';
import { useMenuLateral } from '@/interfaces-graficas/contextos/ContextoMenuLateral';
import styles from '@/interfaces-graficas/componentes/layout/MenuLateral/MenuLateral.module.css';

const ATRASO_FECHAR_MINI_MENU_MS = 200;

interface MiniMenuAberto {
  itemId: string;
  topo: number;
  esquerda: number;
}

function obterSecoesIniciaisAbertas(pathname: string): Record<string, boolean> {
  const abertas: Record<string, boolean> = {};
  for (const item of MENU_LATERAL) {
    if (item.filhos?.length && secaoMenuAtiva(pathname, item)) {
      abertas[item.id] = true;
    }
  }
  return abertas;
}

function obterOpcoesMiniMenu(item: ItemMenuLateral): SubitemMenuLateral[] {
  if (!item.filhos || item.filhos.length <= 1) {
    return [];
  }

  return item.filhos;
}

function renderIconeMenu(Icone: LucideIcon) {
  return (
    <span className={styles.menu__icone} aria-hidden="true">
      <Icone size={18} strokeWidth={1.75} />
    </span>
  );
}

export function MenuLateral() {
  const { expandido, alternarExpansao } = useMenuLateral();
  const { pathname } = useLocation();
  const menuRef = useRef<HTMLElement>(null);
  const timerFecharRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>(() =>
    obterSecoesIniciaisAbertas(pathname),
  );
  const [miniMenu, setMiniMenu] = useState<MiniMenuAberto | null>(null);

  const itemMiniMenu = miniMenu
    ? MENU_LATERAL.find((item) => item.id === miniMenu.itemId)
    : undefined;

  useEffect(() => {
    setSecoesAbertas((anterior) => {
      const atualizado = { ...anterior };
      for (const item of MENU_LATERAL) {
        if (item.filhos?.length && secaoMenuAtiva(pathname, item)) {
          atualizado[item.id] = true;
        }
      }
      return atualizado;
    });
  }, [pathname]);

  useEffect(() => {
    setMiniMenu(null);
  }, [pathname, expandido]);

  function aoAlternarExpansaoMenu() {
    if (expandido) {
      setSecoesAbertas({});
    } else {
      setSecoesAbertas(obterSecoesIniciaisAbertas(pathname));
    }

    alternarExpansao();
  }

  useEffect(() => {
    return () => {
      if (timerFecharRef.current) {
        clearTimeout(timerFecharRef.current);
      }
    };
  }, []);

  function cancelarFechamentoMiniMenu() {
    if (timerFecharRef.current) {
      clearTimeout(timerFecharRef.current);
      timerFecharRef.current = null;
    }
  }

  function abrirMiniMenu(item: ItemMenuLateral, alvo: HTMLElement) {
    if (expandido) {
      return;
    }

    const opcoes = obterOpcoesMiniMenu(item);
    if (opcoes.length === 0) {
      return;
    }

    cancelarFechamentoMiniMenu();
    const rect = alvo.getBoundingClientRect();
    setMiniMenu({
      itemId: item.id,
      topo: rect.top,
      esquerda: rect.right,
    });
  }

  function agendarFechamentoMiniMenu() {
    if (expandido) {
      return;
    }
    cancelarFechamentoMiniMenu();
    timerFecharRef.current = setTimeout(() => {
      setMiniMenu(null);
      timerFecharRef.current = null;
    }, ATRASO_FECHAR_MINI_MENU_MS);
  }

  function alternarSecaoPorClique(item: ItemMenuLateral) {
    if (!expandido) {
      return;
    }
    setSecoesAbertas((anterior) => ({
      ...anterior,
      [item.id]: !anterior[item.id],
    }));
  }

  function renderMiniMenuPortal() {
    if (expandido || !miniMenu || !itemMiniMenu) {
      return null;
    }

    const opcoes = obterOpcoesMiniMenu(itemMiniMenu);
    if (opcoes.length === 0) {
      return null;
    }

    return createPortal(
      <div
        className={styles.menu__mini}
        data-destaque={itemMiniMenu.destaque}
        style={{ top: miniMenu.topo, left: miniMenu.esquerda }}
        role="menu"
        aria-label={itemMiniMenu.titulo}
        onMouseEnter={cancelarFechamentoMiniMenu}
        onMouseLeave={agendarFechamentoMiniMenu}
      >
        <p className={styles.menu__mini_titulo}>{itemMiniMenu.titulo}</p>
        <ul className={styles.menu__mini_lista}>
          {opcoes.map((opcao) => (
            <li key={opcao.rota}>
              <NavLink
                to={opcao.rota}
                role="menuitem"
                end={opcao.rota === '/dashboard'}
                className={({ isActive }) =>
                  [
                    styles.menu__mini_item,
                    isActive || subitemMenuAtivo(pathname, opcao)
                      ? styles['menu__mini_item--ativo']
                      : '',
                  ].join(' ')
                }
                onClick={() => setMiniMenu(null)}
              >
                {opcao.titulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>,
      document.body,
    );
  }

  function eventosMiniMenuColapsado(item: ItemMenuLateral) {
    if (expandido || obterOpcoesMiniMenu(item).length === 0) {
      return {};
    }

    return {
      onMouseEnter: (evento: MouseEvent<HTMLElement>) => {
        abrirMiniMenu(item, evento.currentTarget);
      },
      onMouseLeave: agendarFechamentoMiniMenu,
      onFocus: (evento: FocusEvent<HTMLElement>) => {
        abrirMiniMenu(item, evento.currentTarget);
      },
      onBlur: agendarFechamentoMiniMenu,
    };
  }

  function renderItemComFilhos(item: ItemMenuLateral) {
    const submenuAberto = expandido && secoesAbertas[item.id] === true;
    const miniMenuAberto = !expandido && miniMenu?.itemId === item.id;
    const secaoAtiva = secaoMenuAtiva(pathname, item);
    const Icone = item.icone;
    const eventosColapsado = eventosMiniMenuColapsado(item);

    return (
      <li key={item.id} className={styles.menu__item} data-destaque={item.destaque}>
        <button
          type="button"
          className={`${styles.menu__secao} ${secaoAtiva ? styles['menu__secao--ativa'] : ''} ${miniMenuAberto ? styles['menu__secao--mini'] : ''}`}
          onClick={() => alternarSecaoPorClique(item)}
          aria-expanded={submenuAberto || miniMenuAberto}
          aria-controls={expandido ? `submenu-${item.id}` : undefined}
          aria-haspopup={!expandido ? 'menu' : undefined}
          {...eventosColapsado}
        >
          <span className={styles.menu__secao_conteudo}>
            {renderIconeMenu(Icone)}
            <span className={styles.menu__rotulo}>{item.titulo}</span>
          </span>
          {expandido && (
            <ChevronDown
              size={16}
              className={`${styles.menu__chevron} ${submenuAberto ? styles['menu__chevron--aberto'] : ''}`}
              aria-hidden="true"
            />
          )}
        </button>
        {submenuAberto && item.filhos && (
          <ul id={`submenu-${item.id}`} className={styles.menu__submenu}>
            {item.filhos.map((filho) => (
              <li key={filho.rota} className={styles.menu__subitem_item}>
                <NavLink
                  to={filho.rota}
                  className={({ isActive }) =>
                    [
                      styles.menu__subitem,
                      isActive || subitemMenuAtivo(pathname, filho)
                        ? styles['menu__subitem--ativo']
                        : '',
                    ].join(' ')
                  }
                >
                  {filho.titulo}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  function renderItemDireto(item: ItemMenuLateral) {
    if (!item.rota) {
      return null;
    }

    const Icone = item.icone;
    const miniMenuAberto = !expandido && miniMenu?.itemId === item.id;
    const eventosColapsado = eventosMiniMenuColapsado(item);

    return (
      <li key={item.id} className={styles.menu__item} data-destaque={item.destaque}>
        <NavLink
          to={item.rota}
          end={item.id === 'dashboard'}
          className={({ isActive }) =>
            [
              styles.menu__link,
              isActive ? styles['menu__link--ativo'] : '',
              miniMenuAberto ? styles['menu__link--mini'] : '',
            ].join(' ')
          }
          {...eventosColapsado}
        >
          {renderIconeMenu(Icone)}
          <span className={styles.menu__rotulo}>{item.titulo}</span>
        </NavLink>
      </li>
    );
  }

  function renderAlternarMenu() {
    const rotulo = expandido ? 'Fechar menu' : 'Abrir menu';
    const IconeAlternar = expandido ? ChevronLeft : ChevronRight;

    return (
      <li className={styles.menu__item} data-destaque="controle">
        <button
          type="button"
          className={styles.menu__link}
          onClick={aoAlternarExpansaoMenu}
          aria-label={rotulo}
          aria-expanded={expandido}
          aria-controls="menu-lateral-principal"
        >
          <span className={styles.menu__icone} aria-hidden="true">
            <IconeAlternar size={18} strokeWidth={1.75} />
          </span>
          <span className={styles.menu__rotulo}>{rotulo}</span>
        </button>
      </li>
    );
  }

  return (
    <aside
      ref={menuRef}
      className={`${styles.menu} ${!expandido ? styles['menu--colapsado'] : ''}`}
    >
      <nav
        id="menu-lateral-principal"
        className={styles.menu__nav}
        aria-label="Menu principal"
      >
        <ul className={styles.menu__lista}>
          {MENU_LATERAL.map((item) =>
            item.filhos?.length ? renderItemComFilhos(item) : renderItemDireto(item),
          )}
          {renderAlternarMenu()}
        </ul>
      </nav>
      {renderMiniMenuPortal()}
    </aside>
  );
}
