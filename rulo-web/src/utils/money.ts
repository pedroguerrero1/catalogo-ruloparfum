const formatter = new Intl.NumberFormat('es-AR');

export function moneyARS(n: number): string {
  return formatter.format(n);
}
