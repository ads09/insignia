export type Role = 'USER' | 'ADMIN';

export interface CurrentUser {
  username: string;
  role: Role;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}
