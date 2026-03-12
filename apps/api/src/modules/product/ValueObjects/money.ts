import { InvalidMoneyError } from '../Errors/index.js';

const DEFAULT_CURRENCY = 'USD';
const SUPPORTED_CURRENCIES = new Set(['USD', 'EUR', 'GBP']);

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  public static create(amount: number, currency: string = DEFAULT_CURRENCY): Money {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new InvalidMoneyError('Amount must be a finite number.');
    }
    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative.');
    }
    const code = currency.toUpperCase().trim();
    if (!SUPPORTED_CURRENCIES.has(code)) {
      throw new InvalidMoneyError(`Unsupported currency: ${currency}. Supported: ${[...SUPPORTED_CURRENCIES].join(', ')}.`);
    }
    return new Money(Math.round(amount * 100) / 100, code);
  }

  public static fromExisting(amount: number, currency: string): Money {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new InvalidMoneyError('Invalid amount.');
    }
    return new Money(amount, currency);
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public toJSON(): { amount: number; currency: string } {
    return { amount: this.amount, currency: this.currency };
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
