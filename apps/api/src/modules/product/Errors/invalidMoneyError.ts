import { DomainError } from '../../../shared/errors/index.js';

export class InvalidMoneyError extends DomainError {
  public constructor(message: string) {
    super(message, 'INVALID_MONEY');
  }
}
