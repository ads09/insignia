import { DomainError } from '../../../shared/domain/domain.error.js';

export class UsernameAlreadyExistsError extends DomainError {
  readonly kind = 'conflict';

  constructor() {
    super('Username already exists');
  }
}
