import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retrying cannot fix a client error (400, 401, 403, 404...).
        retry: (failureCount, error) =>
          failureCount < 2 &&
          !(
            isAxiosError(error) &&
            error.response &&
            error.response.status < 500
          ),
      },
    },
  });
}
