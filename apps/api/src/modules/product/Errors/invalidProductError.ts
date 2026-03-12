import { DomainError } from '../../../shared/errors/index.js';

export class InvalidProductError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_PRODUCT');
  }
}
