import { Prisma } from '../../../generated/prisma/client.js';

/** Unique constraint violation, see https://www.prisma.io/docs/orm/reference/error-reference */
export function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
