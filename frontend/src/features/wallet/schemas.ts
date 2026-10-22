import { z } from 'zod';

/** Upper bound (exclusive) of a single topup, from the API specification. */
const TOP_UP_LIMIT = 10_000_000;
const MAX_DECIMALS = 8;

const AMOUNT_PATTERN = new RegExp(`^\\d+([.,]\\d{1,${MAX_DECIMALS}})?$`);

/** A positive amount typed as text; both `,` and `.` are accepted as the decimal separator. */
const amount = z
  .string()
  .trim()
  .min(1, 'Nominal wajib diisi.')
  .regex(
    AMOUNT_PATTERN,
    `Masukkan angka tanpa titik ribuan, maksimal ${MAX_DECIMALS} desimal.`,
  )
  .transform((value) => Number(value.replace(',', '.')))
  .refine((value) => value > 0, 'Nominal harus lebih dari 0.');

export const topUpSchema = z.object({
  amount: amount.refine(
    (value) => value < TOP_UP_LIMIT,
    'Nominal topup harus kurang dari 10.000.000.',
  ),
});

export const transferSchema = z.object({
  to_username: z.string().trim().min(1, 'Username tujuan wajib diisi.'),
  amount,
});
