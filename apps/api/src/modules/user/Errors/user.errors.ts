import { DomainError } from '../../../shared/errors/index.js';

export class InvalidEmailError extends DomainError {
  public constructor(value: string) {
    super(`Invalid email: "${value}".`, 'INVALID_EMAIL');
  }
}

export class InvalidUserError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_USER');
  }
}
