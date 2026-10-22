import { Amount } from './amount.js';
import { InvalidAmountError } from './invalid-amount.error.js';

describe('Amount', () => {
  it.each([1, 0.5, 1000, 9_999_999.99, 0.00000001, 123.12345678])(
    'accepts %s',
    (value) => {
      expect(Amount.of(value).value).toBe(value);
    },
  );

  it.each([0, -1, -0.01, Number.NaN, Infinity, -Infinity])(
    'rejects %s',
    (value) => {
      expect(() => Amount.of(value)).toThrow(InvalidAmountError);
    },
  );

  it.each([0.000000001, 1.123456789, 1e-9])(
    'rejects %s for having more than 8 decimal places',
    (value) => {
      expect(() => Amount.of(value)).toThrow(InvalidAmountError);
    },
  );

  it('uses the given error message', () => {
    expect(() => Amount.of(0, 'Invalid topup amount')).toThrow(
      'Invalid topup amount',
    );
  });

  it('compares against a limit', () => {
    expect(Amount.of(10).isGreaterThanOrEqual(10)).toBe(true);
    expect(Amount.of(9.99).isGreaterThanOrEqual(10)).toBe(false);
  });

  it('serialises to a decimal string', () => {
    expect(Amount.of(250.5).toString()).toBe('250.5');
  });
});
