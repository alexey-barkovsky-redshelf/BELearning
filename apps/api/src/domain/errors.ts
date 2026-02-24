export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class InvalidSlugError extends DomainError {
  constructor(value: string) {
    super(`Invalid slug: "${value}".`, 'INVALID_SLUG');
    this.name = 'InvalidSlugError';
  }
}

export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`Invalid email: "${value}".`, 'INVALID_EMAIL');
    this.name = 'InvalidEmailError';
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_MONEY');
    this.name = 'InvalidMoneyError';
  }
}

export class InvalidProductError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_PRODUCT');
    this.name = 'InvalidProductError';
  }
}

export class InvalidOrderError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_ORDER');
    this.name = 'InvalidOrderError';
  }
}

export class InvalidUserError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_USER');
    this.name = 'InvalidUserError';
  }
}

export class InvalidUserProductAccessError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_ACCESS');
    this.name = 'InvalidUserProductAccessError';
  }
}
