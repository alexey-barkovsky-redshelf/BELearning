import { InvalidMoneyError } from '../errors.js';

const DEFAULT_CURRENCY = 'USD';
const SUPPORTED_CURRENCIES = new Set(['USD', 'EUR', 'GBP']);

export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static create(amount: number, currency: string = DEFAULT_CURRENCY): Money {
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

  static fromExisting(amount: number, currency: string): Money {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new InvalidMoneyError('Invalid amount.');
    }
    return new Money(amount, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  toJSON(): { amount: number; currency: string } {
    return { amount: this.amount, currency: this.currency };
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
