import { DomainError } from '../../../shared/domain/domain.error.js';

export class InvalidTransactionQueryError extends DomainError {
  readonly kind = 'validation';

  constructor(message: string) {
    super(message);
  }
}
