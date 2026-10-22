import { setupServer } from 'msw/node';
import { env } from '@/shared/config/env';

/** Mock API. Each test registers the handlers it needs with `server.use()`. */
export const server = setupServer();

export const apiUrl = (path: string) => `${env.apiBaseUrl}${path}`;
