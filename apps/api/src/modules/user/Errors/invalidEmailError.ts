import { DomainError } from '../../../shared/errors/index.js';

export class InvalidEmailError extends DomainError {
  public constructor(value: string) {
    super(`Invalid email: "${value}".`, 'INVALID_EMAIL');
  }
}
