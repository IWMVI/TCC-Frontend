export function mascararCpfCnpj(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  
  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  return numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function mascararCelular(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function mascararCep(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  return numeros
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function mascararTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return mascararCelular(valor);
}

export function removerFormatacao(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarData(data: string): string {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataBrasileira(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
