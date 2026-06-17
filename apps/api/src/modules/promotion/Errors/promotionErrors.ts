import { DomainError } from '../../../shared/errors/index.js';

export class InvalidPromotionError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_PROMOTION');
  }
}
