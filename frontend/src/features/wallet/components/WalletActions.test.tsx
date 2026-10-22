import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { WalletActions } from './WalletActions';

describe('WalletActions', () => {
  it('opens the topup form in a dialog', async () => {
    const { user } = renderWithProviders(<WalletActions />, {
      user: TEST_USER,
    });

    await user.click(screen.getByRole('button', { name: 'Topup' }));

    expect(screen.getByRole('dialog', { name: 'Topup saldo' })).toBeVisible();
    expect(screen.getByLabelText('Nominal')).toBeVisible();
  });

  it('transfers from the dialog and closes it again', async () => {
    server.use(
      http.post(
        apiUrl('/transfer'),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { user } = renderWithProviders(<WalletActions />, {
      user: TEST_USER,
    });

    await user.click(screen.getByRole('button', { name: 'Transfer' }));
    await user.type(screen.getByLabelText('Username tujuan'), 'bob');
    await user.type(screen.getByLabelText('Nominal'), '5');
    await user.click(screen.getByRole('button', { name: 'Kirim transfer' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Transfer 5 ke bob berhasil.',
    );

    await user.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
