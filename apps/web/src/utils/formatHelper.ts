export class FormatHelper {
  public static round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  public static formatMoney(amount: number, currency: string): string {
    return `${FormatHelper.round2(amount).toFixed(2)} ${currency}`;
  }
}
