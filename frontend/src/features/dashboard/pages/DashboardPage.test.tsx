import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { DashboardPage } from './DashboardPage';

const emptyPage = {
  data: [],
  meta: { page: 1, limit: 6, total: 0, total_pages: 0 },
};

function mockStats() {
  server.use(
    http.get(apiUrl('/transactions'), () =>
      HttpResponse.json({
        data: [
          {
            id: '1',
            type: 'credit',
            username: 'dave',
            amount: 75,
            created_at: '2024-10-02T10:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 6, total: 1, total_pages: 1 },
      }),
    ),
    http.get(apiUrl('/balance'), () => HttpResponse.json({ balance: 1234.5 })),
    http.get(apiUrl('/top_users'), () =>
      HttpResponse.json([
        { username: 'bob', transacted_value: 900 },
        { username: 'alice', transacted_value: 300 },
      ]),
    ),
    http.get(apiUrl('/top_transactions_per_user'), () =>
      HttpResponse.json([
        { username: 'bob', amount: -500 },
        { username: 'carol', amount: 200 },
      ]),
    ),
  );
}

describe('DashboardPage', () => {
  it('shows the balance and both charts', async () => {
    mockStats();
    renderWithProviders(<DashboardPage />, { user: TEST_USER });

    expect(await screen.findByText('1.234,5')).toBeVisible();
    expect(
      await screen.findByRole('img', { name: /top 10 pengguna/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /10 transaksi terbesar/ }),
    ).toBeInTheDocument();
  });

  it('lists the latest transactions', async () => {
    mockStats();
    renderWithProviders(<DashboardPage />, { user: TEST_USER });

    expect(await screen.findByText('dave')).toBeVisible();
    expect(screen.getByText('+75')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat semua' })).toHaveAttribute(
      'href',
      '/transactions',
    );
  });

  it('shows the chart data as a table', async () => {
    mockStats();
    const { user } = renderWithProviders(<DashboardPage />, {
      user: TEST_USER,
    });

    const [transactionsTable] = await screen.findAllByRole('button', {
      name: 'Tabel',
    });
    await user.click(transactionsTable!);

    expect(screen.getByRole('cell', { name: 'Keluar ke bob' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '-500' })).toBeVisible();
    expect(
      screen.getByRole('cell', { name: 'Masuk dari carol' }),
    ).toBeVisible();
  });

  it('explains an empty chart', async () => {
    server.use(
      http.get(apiUrl('/transactions'), () => HttpResponse.json(emptyPage)),
      http.get(apiUrl('/balance'), () => HttpResponse.json({ balance: 0 })),
      http.get(apiUrl('/top_users'), () => HttpResponse.json([])),
      http.get(apiUrl('/top_transactions_per_user'), () =>
        HttpResponse.json([]),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: TEST_USER });

    expect(await screen.findByText(/Belum ada transfer/)).toBeVisible();
  });
});
