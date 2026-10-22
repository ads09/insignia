import { describe, expect, it } from 'vitest';
import { topUpSchema, transferSchema } from './schemas';

const topUp = (amount: string) => topUpSchema.safeParse({ amount });

describe('topUpSchema', () => {
  it.each([
    ['1000', 1000],
    [' 0,5 ', 0.5],
    ['9999999.99999999', 9_999_999.99999999],
  ])('accepts %j', (input, expected) => {
    expect(topUp(input)).toMatchObject({
      success: true,
      data: { amount: expected },
    });
  });

  it.each([
    ['', 'Nominal wajib diisi.'],
    ['0', 'Nominal harus lebih dari 0.'],
    ['10000000', 'Nominal topup harus kurang dari 10.000.000.'],
    ['1.000.000', 'Masukkan angka tanpa titik ribuan, maksimal 8 desimal.'],
    ['1.123456789', 'Masukkan angka tanpa titik ribuan, maksimal 8 desimal.'],
    ['-5', 'Masukkan angka tanpa titik ribuan, maksimal 8 desimal.'],
  ])('rejects %j', (input, message) => {
    const result = topUp(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe('transferSchema', () => {
  it('trims the username and parses the amount', () => {
    expect(
      transferSchema.parse({ to_username: ' bob ', amount: '25' }),
    ).toEqual({
      to_username: 'bob',
      amount: 25,
    });
  });

  it('has no upper limit on the amount', () => {
    expect(
      transferSchema.safeParse({ to_username: 'bob', amount: '50000000' })
        .success,
    ).toBe(true);
  });

  it('requires a username', () => {
    expect(
      transferSchema.safeParse({ to_username: '  ', amount: '1' }).success,
    ).toBe(false);
  });
});
