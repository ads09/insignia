import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { tokenStorage } from '@/shared/lib/token-storage';
import { renderRoutes, TEST_ADMIN, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { routes } from './routes';

const emptyPage = {
  data: [],
  meta: { page: 1, limit: 10, total: 0, total_pages: 0 },
};

describe('routes', () => {
  it('sends anonymous visitors to the login page', async () => {
    const { router } = renderRoutes(routes, { route: '/transactions' });

    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('signs out when the token is rejected', async () => {
    tokenStorage.set('expired-token');
    server.use(
      http.get(apiUrl('/me'), () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
    );
    renderRoutes(routes, { route: '/' });

    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeVisible();
    expect(tokenStorage.get()).toBeNull();
  });

  it('hides the administrator pages from users', async () => {
    renderRoutes(routes, { user: TEST_USER, route: '/admin/transactions' });

    expect(
      await screen.findByRole('heading', { name: 'Akses ditolak' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Semua transaksi' }),
    ).not.toBeInTheDocument();
  });

  it('shows the administrator pages to administrators', async () => {
    server.use(
      http.get(apiUrl('/admin/transactions'), () =>
        HttpResponse.json(emptyPage),
      ),
    );
    renderRoutes(routes, { user: TEST_ADMIN, route: '/admin/transactions' });

    expect(
      await screen.findByRole('heading', { name: 'Semua transaksi' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Semua transaksi' })).toBeVisible();
  });

  it('sends a signed-in user away from the login page', async () => {
    server.use(
      http.get(apiUrl('/balance'), () => HttpResponse.json({ balance: 0 })),
      http.get(apiUrl('/top_users'), () => HttpResponse.json([])),
      http.get(apiUrl('/transactions'), () => HttpResponse.json(emptyPage)),
      http.get(apiUrl('/top_transactions_per_user'), () =>
        HttpResponse.json([]),
      ),
    );
    const { router } = renderRoutes(routes, {
      user: TEST_USER,
      route: '/login',
    });

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe('/');
  });
});
