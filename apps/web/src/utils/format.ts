/** Rounds to 2 decimal places (for money). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formats amount with 2 decimals and currency code. */
export function formatMoney(amount: number, currency: string): string {
  return `${round2(amount).toFixed(2)} ${currency}`;
}
