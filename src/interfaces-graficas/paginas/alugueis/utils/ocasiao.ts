import {TipoOcasiao} from '../../../../domain/entidades';

const TIPO_OCASIAO_ALIAS: Record<TipoOcasiao, string> = {
	[TipoOcasiao.CASAMENTO]: 'Casamento',
	[TipoOcasiao.FORMATURA]: 'Formatura',
	[TipoOcasiao.BAILE_DE_GALA]: 'Baile de Gala',
	[TipoOcasiao.FESTA_FORMAL]: 'Festa Formal',
	[TipoOcasiao.EVENTO_CORPORATIVO]: 'Evento Corporativo',
	[TipoOcasiao.JANTAR_FORMAL]: 'Jantar Formal',
	[TipoOcasiao.CERIMONIA]: 'Cerimônia',
};

export function obterAliasTipoOcasiao(ocasiao: TipoOcasiao): string {
	return TIPO_OCASIAO_ALIAS[ocasiao] ?? ocasiao;
}
