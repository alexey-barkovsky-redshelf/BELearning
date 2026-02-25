export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  return `${round2(amount).toFixed(2)} ${currency}`;
}
