import { InvalidAmountError } from './invalid-amount.error.js';

/** Matches the precision of the DECIMAL(20, 8) money columns. */
export const AMOUNT_MAX_DECIMAL_PLACES = 8;

/**
 * A strictly positive monetary amount with at most eight decimal places.
 * Arithmetic on balances happens in the database with exact DECIMAL
 * precision; this value object only guarantees the input is valid.
 */
export class Amount {
  private constructor(readonly value: number) {}

  static of(value: number, errorMessage?: string): Amount {
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      decimalPlaces(value) > AMOUNT_MAX_DECIMAL_PLACES
    ) {
      throw new InvalidAmountError(errorMessage);
    }
    return new Amount(value);
  }

  isGreaterThanOrEqual(limit: number): boolean {
    return this.value >= limit;
  }

  toString(): string {
    return this.value.toString();
  }
}

function decimalPlaces(value: number): number {
  const [, fraction = '', exponent = '0'] =
    /^-?\d+(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(value.toString()) ?? [];
  return Math.max(0, fraction.length - Number(exponent));
}
