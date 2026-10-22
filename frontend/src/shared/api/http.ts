import axios from 'axios';
import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/token-storage';

/** The single Axios instance used by every feature. */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
});

let onUnauthorized: (() => void) | undefined;

/** Registers what happens when an authenticated request is rejected with 401. */
export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  onUnauthorized = handler;
}

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(undefined, (error: unknown) => {
  // A 401 on a request that carried a token means the session is no longer
  // valid. A 401 without a token (wrong password on login) is a normal error.
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    error.config?.headers.has('Authorization')
  ) {
    onUnauthorized?.();
  }
  return Promise.reject(error);
});
