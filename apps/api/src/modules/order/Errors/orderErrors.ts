import { DomainError } from '../../../shared/errors/index.js';

export class InvalidOrderError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_ORDER');
  }
}
