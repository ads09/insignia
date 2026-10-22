import { DomainError } from '../../../shared/domain/domain.error.js';

export class RecipientNotFoundError extends DomainError {
  readonly kind = 'not_found';

  constructor() {
    super('Destination user not found');
  }
}
