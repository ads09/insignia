import { ArgumentsHost } from '@nestjs/common';
import { DomainError, DomainErrorKind } from '../domain/domain.error.js';
import { DomainErrorFilter } from './domain-error.filter.js';

class TestError extends DomainError {
  constructor(readonly kind: DomainErrorKind) {
    super('Something went wrong');
  }
}

function createHost() {
  const response = { status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('DomainErrorFilter', () => {
  it.each<[DomainErrorKind, number, string]>([
    ['validation', 400, 'Bad Request'],
    ['unauthorized', 401, 'Unauthorized'],
    ['forbidden', 403, 'Forbidden'],
    ['not_found', 404, 'Not Found'],
    ['conflict', 409, 'Conflict'],
  ])('maps %s errors to %i', (kind, status, error) => {
    const { host, response } = createHost();

    new DomainErrorFilter().catch(new TestError(kind), host);

    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: status,
      message: 'Something went wrong',
      error,
      code: 'TestError',
    });
  });
});
