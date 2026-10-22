import { Prisma } from '../../../generated/prisma/client.js';

/** Converts a DECIMAL column value to the JSON number required by the API. */
export function decimalToNumber(
  value: Prisma.Decimal | string | number,
): number {
  return Number(value.toString());
}
