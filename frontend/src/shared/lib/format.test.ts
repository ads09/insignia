import { describe, expect, it } from 'vitest';
import { formatAmount, formatCompact, formatSignedAmount } from './format';

describe('format', () => {
  it('formats amounts with Indonesian separators and up to 8 decimals', () => {
    expect(formatAmount(1_234_567.5)).toBe('1.234.567,5');
    expect(formatAmount(0.12345678)).toBe('0,12345678');
  });

  it('shows the sign of signed amounts', () => {
    expect(formatSignedAmount(-80)).toBe('-80');
    expect(formatSignedAmount(1000)).toBe('+1.000');
    expect(formatSignedAmount(0)).toBe('0');
  });

  it('abbreviates large numbers for axes', () => {
    expect(formatCompact(12_500)).toBe('12,5\u00a0rb');
  });
});
