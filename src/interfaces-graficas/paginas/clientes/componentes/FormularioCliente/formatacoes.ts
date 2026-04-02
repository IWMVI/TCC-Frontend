export function formatarMedida(c: number): string {
  const s = String(c ?? 0).padStart(3, '0');
  return `${s.slice(0, -2)},${s.slice(-2)}`;
}
