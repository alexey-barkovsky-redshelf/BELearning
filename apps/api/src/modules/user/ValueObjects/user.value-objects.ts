import { InvalidEmailError } from '../Errors/user.errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly value: string) {}

  static create(input: string): Email {
    const normalized = input.trim().toLowerCase();
    if (!normalized) {
      throw new InvalidEmailError(input);
    }
    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(input);
    }
    return new Email(normalized);
  }

  static fromExisting(value: string): Email {
    if (!value || !EMAIL_REGEX.test(value)) {
      throw new InvalidEmailError(value);
    }
    return new Email(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
