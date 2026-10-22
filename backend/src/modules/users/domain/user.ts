export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: string;
  username: string;
  /** Null for users registered without a password (allowed by the API spec). */
  passwordHash: string | null;
  role: Role;
}
