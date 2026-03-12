import { DomainError } from '../../../shared/errors/index.js';

export class InvalidSlugError extends DomainError {
  public constructor(value: string) {
    super(`Invalid slug: "${value}".`, 'INVALID_SLUG');
  }
}
