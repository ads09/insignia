import { z } from 'zod';

const USERNAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, 'Username wajib diisi.')
      .max(
        USERNAME_MAX_LENGTH,
        `Username maksimal ${USERNAME_MAX_LENGTH} karakter.`,
      ),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama.',
  });

export type RegisterValues = z.infer<typeof registerSchema>;
