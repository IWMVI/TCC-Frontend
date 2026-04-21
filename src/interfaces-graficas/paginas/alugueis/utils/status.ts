import {StatusAluguel} from '../../../../domain/entidades';

const STATUS_ALUGUEL_ALIAS: Record<StatusAluguel, string> = {
	[StatusAluguel.ATIVO]: 'Ativo',
	[StatusAluguel.CONCLUIDO]: 'Concluído',
	[StatusAluguel.CANCELADO]: 'Cancelado',
};

export function obterAliasStatusAluguel(status: StatusAluguel): string {
	return STATUS_ALUGUEL_ALIAS[status] ?? status;
}

export function obterStatusAluguelPorValor(valor: string | undefined): StatusAluguel | '' {
	if (!valor) {
		return '';
	}

	const normalizado = valor.trim().toLowerCase();

	const correspondente = Object.values(StatusAluguel).find((status) => {
		if (status.toLowerCase() === normalizado) {
			return true;
		}
		return STATUS_ALUGUEL_ALIAS[status].toLowerCase() === normalizado;
	});

	return correspondente ?? '';
}
