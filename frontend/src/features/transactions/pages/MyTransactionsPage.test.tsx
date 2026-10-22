import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import type { Page, UserTransaction } from '../types';
import { MyTransactionsPage } from './MyTransactionsPage';

const TRANSACTIONS: UserTransaction[] = [
  {
    id: '1',
    type: 'debit',
    username: 'bob',
    amount: -80,
    created_at: '2024-10-02T10:00:00.000Z',
  },
  {
    id: '2',
    type: 'topup',
    username: null,
    amount: 1000,
    created_at: '2024-10-01T09:00:00.000Z',
  },
];

/** Answers `GET /transactions` and records the query of every request. */
function mockTransactions(page: Partial<Page<UserTransaction>> = {}) {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(apiUrl('/transactions'), ({ request }) => {
      requests.push(new URL(request.url).searchParams);
      return HttpResponse.json({
        data: TRANSACTIONS,
        meta: { page: 1, limit: 10, total: 2, total_pages: 1 },
        ...page,
      });
    }),
  );
  return requests;
}

const lastRequest = (requests: URLSearchParams[]) =>
  Object.fromEntries(requests.at(-1) ?? []);

describe('MyTransactionsPage', () => {
  it('lists the transactions', async () => {
    mockTransactions();
    renderWithProviders(<MyTransactionsPage />, { user: TEST_USER });

    await screen.findByText('bob');
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]!).getByText('bob')).toBeVisible();
    expect(within(rows[1]!).getByText('-80')).toBeVisible();
    expect(within(rows[2]!).getByText('Topup')).toBeVisible();
    expect(screen.getByText('1–2 dari 2 transaksi')).toBeVisible();
  });

  it('reads the filters from the URL', async () => {
    const requests = mockTransactions();
    renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
      route: '/transactions?type=debit&search=bob&page=2',
    });

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(lastRequest(requests)).toMatchObject({
      type: 'debit',
      search: 'bob',
      page: '2',
    });
    expect(screen.getByRole('button', { name: 'Keluar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Cari lawan transaksi')).toHaveValue('bob');
  });

  it('searches after the user stops typing and returns to page 1', async () => {
    const requests = mockTransactions();
    const { user, router } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
      route: '/transactions?page=3',
    });

    await user.type(screen.getByLabelText('Cari lawan transaksi'), 'bob');

    await waitFor(() =>
      expect(lastRequest(requests)).toMatchObject({ search: 'bob', page: '1' }),
    );
    expect(requests.filter((query) => query.has('search'))).toHaveLength(1);
    expect(router.state.location.search).toBe('?search=bob');
  });

  it('sorts by a column', async () => {
    const requests = mockTransactions();
    const { user } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
    });

    await user.click(await screen.findByRole('button', { name: /Nominal/ }));
    await waitFor(() =>
      expect(lastRequest(requests)).toMatchObject({
        sort: 'amount',
        order: 'desc',
      }),
    );

    await user.click(screen.getByRole('button', { name: /Nominal/ }));
    await waitFor(() =>
      expect(lastRequest(requests)).toMatchObject({
        sort: 'amount',
        order: 'asc',
      }),
    );
  });

  it('pages through the results', async () => {
    const requests = mockTransactions({
      meta: { page: 1, limit: 10, total: 25, total_pages: 3 },
    });
    const { user } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
    });

    await user.click(await screen.findByRole('button', { name: 'Berikutnya' }));

    await waitFor(() =>
      expect(lastRequest(requests)).toMatchObject({ page: '2' }),
    );
  });

  it('offers to clear the filters when nothing matches', async () => {
    mockTransactions({
      data: [],
      meta: { page: 1, limit: 10, total: 0, total_pages: 0 },
    });
    const { user, router } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
      route: '/transactions?type=topup&sort=amount',
    });

    expect(
      await screen.findByText(
        'Tidak ada transaksi yang cocok dengan filter ini.',
      ),
    ).toBeVisible();
    await user.click(
      screen.getAllByRole('button', { name: 'Hapus filter' })[0]!,
    );

    // Sorting is kept, the filters are cleared.
    expect(router.state.location.search).toBe('?sort=amount');
  });

  it('filters by type', async () => {
    const requests = mockTransactions();
    const { user } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
    });

    await user.click(screen.getByRole('button', { name: 'Topup' }));

    await waitFor(() =>
      expect(lastRequest(requests)).toMatchObject({ type: 'topup' }),
    );
  });

  it('keeps the date and amount filters behind the Filter button', async () => {
    mockTransactions();
    const { user } = renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
    });

    expect(screen.queryByLabelText('Dari tanggal')).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    expect(screen.getByLabelText('Dari tanggal')).toBeVisible();
  });

  it('opens the advanced filters when the URL sets one', async () => {
    mockTransactions();
    renderWithProviders(<MyTransactionsPage />, {
      user: TEST_USER,
      route: '/transactions?min_amount=50',
    });

    expect(screen.getByLabelText('Nominal minimal')).toHaveValue('50');
    expect(screen.getByLabelText('Nominal minimal')).toBeVisible();
    expect(screen.getByRole('button', { name: /Filter/ })).toHaveTextContent(
      '1',
    );
  });

  it('shows an error with a retry', async () => {
    server.use(
      http.get(apiUrl('/transactions'), () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    renderWithProviders(<MyTransactionsPage />, { user: TEST_USER });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Terjadi kesalahan di server',
    );
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  });
});
