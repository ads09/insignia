import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setUnauthorizedHandler } from '@/shared/api/http';
import { tokenStorage } from '@/shared/lib/token-storage';
import { getMe } from '../api/auth.api';
import { queryKeys } from '@/shared/api/query-keys';
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => tokenStorage.get());

  const me = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: token !== null,
    staleTime: Infinity,
    retry: false,
  });

  const signIn = useCallback(
    (newToken: string) => {
      tokenStorage.set(newToken);
      queryClient.clear();
      setToken(newToken);
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    setToken(null);
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(undefined);
  }, [signOut]);

  const status: AuthStatus =
    token === null
      ? 'anonymous'
      : me.data
        ? 'authenticated'
        : me.isError
          ? 'error'
          : 'loading';

  const { refetch } = me;
  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: token === null ? null : (me.data ?? null),
      signIn,
      signOut,
      retry: () => void refetch(),
    }),
    [status, token, me.data, signIn, signOut, refetch],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
