import { DomainError } from './domain.error.js';

export class InvalidAmountError extends DomainError {
  readonly kind = 'validation';

  constructor(message = 'Invalid amount') {
    super(message);
  }
}
