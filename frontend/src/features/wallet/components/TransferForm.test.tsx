import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { TransferForm } from './TransferForm';

async function submit(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.type(screen.getByLabelText('Username tujuan'), 'bob');
  await user.type(screen.getByLabelText('Nominal'), '80');
  await user.click(screen.getByRole('button', { name: 'Kirim transfer' }));
}

describe('TransferForm', () => {
  it('validates both fields', async () => {
    const { user } = renderWithProviders(<TransferForm />, { user: TEST_USER });

    await user.click(screen.getByRole('button', { name: 'Kirim transfer' }));

    expect(
      await screen.findByText('Username tujuan wajib diisi.'),
    ).toBeVisible();
    expect(screen.getByText('Nominal wajib diisi.')).toBeVisible();
  });

  it('sends to_username and amount', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('/transfer'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderWithProviders(<TransferForm />, { user: TEST_USER });

    await submit(user);

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Transfer 80 ke bob berhasil.',
    );
    expect(body).toEqual({ to_username: 'bob', amount: 80 });
  });

  it.each([
    [404, 'RecipientNotFoundError', 'User tujuan tidak ditemukan.'],
    [400, 'InsufficientBalanceError', 'Saldo tidak mencukupi.'],
  ])('maps a %i %s response', async (status, code, message) => {
    server.use(
      http.post(apiUrl('/transfer'), () =>
        HttpResponse.json({ code }, { status }),
      ),
    );
    const { user } = renderWithProviders(<TransferForm />, { user: TEST_USER });

    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });
});
