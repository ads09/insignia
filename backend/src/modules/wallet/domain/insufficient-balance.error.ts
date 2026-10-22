import { DomainError } from '../../../shared/domain/domain.error.js';

export class InsufficientBalanceError extends DomainError {
  readonly kind = 'validation';

  constructor() {
    super('Insufficient balance');
  }
}
