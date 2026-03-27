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
