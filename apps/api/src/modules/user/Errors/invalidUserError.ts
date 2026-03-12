import { DomainError } from '../../../shared/errors/index.js';

export class InvalidUserError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_USER');
  }
}
