import { DomainError } from '../../shared/errors/DomainError.js';

export class InvalidSlugError extends DomainError {
  constructor(value: string) {
    super(`Invalid slug: "${value}".`, 'INVALID_SLUG');
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_MONEY');
  }
}

export class InvalidProductError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_PRODUCT');
  }
}
