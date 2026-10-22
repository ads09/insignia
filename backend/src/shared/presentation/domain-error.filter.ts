import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, DomainErrorKind } from '../domain/domain.error.js';

const HTTP_ERROR_BY_KIND: Record<
  DomainErrorKind,
  { status: HttpStatus; error: string }
> = {
  validation: { status: HttpStatus.BAD_REQUEST, error: 'Bad Request' },
  unauthorized: { status: HttpStatus.UNAUTHORIZED, error: 'Unauthorized' },
  forbidden: { status: HttpStatus.FORBIDDEN, error: 'Forbidden' },
  not_found: { status: HttpStatus.NOT_FOUND, error: 'Not Found' },
  conflict: { status: HttpStatus.CONFLICT, error: 'Conflict' },
};

/**
 * Translates domain errors into HTTP responses. The body keeps Nest's default
 * error shape and adds `code` so clients can tell apart errors that share a
 * status (e.g. invalid amount vs. insufficient balance).
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const { status, error } = HTTP_ERROR_BY_KIND[exception.kind];
    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      message: exception.message,
      error,
      code: exception.name,
    });
  }
}
