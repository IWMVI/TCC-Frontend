export function normalizarDataIso(valor: unknown): string {
  if (typeof valor === 'string') {
    return valor.split('T')[0];
  }
  if (Array.isArray(valor) && valor.length >= 3) {
    const [ano, mes, dia] = valor as number[];
    return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }
  return String(valor);
}
