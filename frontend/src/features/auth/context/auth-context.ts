import { createContext } from 'react';
import type { CurrentUser } from '../types';

export type AuthStatus = 'anonymous' | 'loading' | 'error' | 'authenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  /** Stores the token of a fresh session and loads the user. */
  signIn: (token: string) => void;
  signOut: () => void;
  /** Retries loading the user after a failure other than 401. */
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
