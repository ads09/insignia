import { DomainError } from '../../../shared/domain/domain.error.js';

export class SelfTransferError extends DomainError {
  readonly kind = 'validation';

  constructor() {
    super('Cannot transfer to yourself');
  }
}
