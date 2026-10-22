/**
 * Category of a business rule violation. The presentation layer maps each
 * kind to a transport status (HTTP), so the domain never knows about HTTP.
 */
export type DomainErrorKind =
  'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict';

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
