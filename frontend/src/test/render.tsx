import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactElement } from 'react';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router';
import { AuthProvider, type CurrentUser } from '@/features/auth';
import { tokenStorage } from '@/shared/lib/token-storage';
import { apiUrl, server } from './server';

export const TEST_USER: CurrentUser = { username: 'alice', role: 'USER' };
export const TEST_ADMIN: CurrentUser = { username: 'admin', role: 'ADMIN' };

interface RenderOptions {
  /** Signs in as this user: stores a token and answers `GET /me`. */
  user?: CurrentUser;
  route?: string;
}

/** Renders a route tree with the app's providers and a memory router. */
export function renderRoutes(
  routes: RouteObject[],
  { user, route = '/' }: RenderOptions = {},
) {
  if (user) {
    tokenStorage.set('test-token');
    server.use(http.get(apiUrl('/me'), () => HttpResponse.json(user)));
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [route] });

  return {
    user: userEvent.setup(),
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>,
    ),
  };
}

/** Renders a single component at every path. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return renderRoutes([{ path: '*', element: ui }], options);
}
