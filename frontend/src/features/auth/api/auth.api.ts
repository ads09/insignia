import { http } from '@/shared/api/http';
import type { Credentials, CurrentUser, TokenResponse } from '../types';

export async function login(credentials: Credentials): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>('/login', credentials);
  return data;
}

/** `POST /user`: creates the account and returns a token for it. */
export async function register(
  credentials: Credentials,
): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>('/user', credentials);
  return data;
}

export async function getMe(): Promise<CurrentUser> {
  const { data } = await http.get<CurrentUser>('/me');
  return data;
}
