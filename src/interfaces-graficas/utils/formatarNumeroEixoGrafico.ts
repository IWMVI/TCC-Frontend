export function formatarNumeroEixoGrafico(valor: number): string {
  if (valor <= 0) {
    return '0';
  }

  return String(Math.round(valor));
}
