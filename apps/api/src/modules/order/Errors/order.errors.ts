import { DomainError } from '../../../shared/errors/DomainError.js';

export class InvalidOrderError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_ORDER');
  }
}
