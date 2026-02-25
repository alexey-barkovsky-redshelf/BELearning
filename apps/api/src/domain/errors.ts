export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, (this.constructor as typeof DomainError).prototype);
  }
}

export class InvalidSlugError extends DomainError {
  constructor(value: string) {
    super(`Invalid slug: "${value}".`, 'INVALID_SLUG');
  }
}

export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`Invalid email: "${value}".`, 'INVALID_EMAIL');
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

export class InvalidOrderError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_ORDER');
  }
}

export class InvalidUserError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_USER');
  }
}

export class InvalidUserProductAccessError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_ACCESS');
  }
}
