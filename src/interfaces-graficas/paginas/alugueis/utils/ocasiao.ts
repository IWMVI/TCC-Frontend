import {TipoOcasiao} from '@domain/entidades';

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

export function obterTipoOcasiaoPorValor(valor: string | undefined): TipoOcasiao | '' {
	if (!valor) {
		return '';
	}

	const normalizado = valor.trim().toLowerCase();

	const correspondente = Object.values(TipoOcasiao).find((tipo) => {
		if (tipo.toLowerCase() === normalizado) {
			return true;
		}
		return TIPO_OCASIAO_ALIAS[tipo].toLowerCase() === normalizado;
	});

	return correspondente ?? '';
}
