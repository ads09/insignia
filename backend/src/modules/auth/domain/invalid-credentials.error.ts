import { DomainError } from '../../../shared/domain/domain.error.js';

export class InvalidCredentialsError extends DomainError {
  readonly kind = 'unauthorized';

  constructor() {
    super('Invalid username or password');
  }
}
