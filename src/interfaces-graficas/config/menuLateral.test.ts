import { MENU_LATERAL, secaoMenuAtiva, subitemMenuAtivo } from '@/interfaces-graficas/config/menuLateral';

describe('menuLateral', () => {
  it('deve manter dashboard primeiro e ordenar demais itens alfabeticamente', () => {
    expect(MENU_LATERAL[0]?.id).toBe('dashboard');

    const titulos = MENU_LATERAL.slice(1).map((item) => item.titulo);
    const ordenados = [...titulos].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(titulos).toEqual(ordenados);

    const clientes = MENU_LATERAL.find((item) => item.id === 'clientes');
    const subitens = clientes?.filhos?.map((filho) => filho.titulo) ?? [];
    const subitensOrdenados = [...subitens].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(subitens).toEqual(subitensOrdenados);
  });

  it('deve marcar seção de clientes ativa em rotas filhas', () => {
    const clientes = MENU_LATERAL.find((item) => item.id === 'clientes');
    expect(clientes).toBeDefined();
    expect(secaoMenuAtiva('/clientes/12/editar', clientes!)).toBe(true);
  });

  it('deve marcar subitem listar em edição', () => {
    const listar = { titulo: 'Listar', rota: '/clientes/listar' };
    expect(subitemMenuAtivo('/clientes/12/editar', listar)).toBe(true);
    expect(subitemMenuAtivo('/clientes/novo', listar)).toBe(false);
  });

  it('deve marcar dashboard apenas na rota exata', () => {
    const dashboard = MENU_LATERAL.find((item) => item.id === 'dashboard');
    expect(secaoMenuAtiva('/dashboard', dashboard!)).toBe(true);
    expect(secaoMenuAtiva('/dashboard/alugueis-ativos', dashboard!)).toBe(false);
  });
});
