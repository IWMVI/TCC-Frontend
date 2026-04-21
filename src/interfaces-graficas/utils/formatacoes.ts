export function mascararCpfCnpj(valor: string): string {
    const numeros = valor.replaceAll(/\D/g, '').slice(0, 14);

    if (numeros.length <= 11) {
        return numeros
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
    }

    return numeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
}

export function mascararCelular(valor: string): string {
    const numeros = valor.replaceAll(/\D/g, '');
    return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function mascararCep(valor: string): string {
    const numeros = valor.replaceAll(/\D/g, '');
    return numeros.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function mascararTelefone(valor: string): string {
    const numeros = valor.replaceAll(/\D/g, '');
    if (numeros.length <= 10) {
        return numeros.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return mascararCelular(valor);
}

const MAX_DIGITOS_MOEDA_BR = 8;

export function formatarMoedaBrPartindoDeDigitos(valorDigitado: string): string {
    const apenasDigitos = valorDigitado.replace(/\D/g, '').slice(0, MAX_DIGITOS_MOEDA_BR);
    const centavos = Number.parseInt(apenasDigitos || '0', 10);

    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function converterMoedaBrParaNumero(valor: string): number {
    return Number.parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

export function formatarNumeroParaMoedaBr(valor: number): string {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
