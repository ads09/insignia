import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, TEST_USER } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { TopUpForm } from './TopUpForm';

describe('TopUpForm', () => {
  it('rejects amounts of 10.000.000 or more', async () => {
    const { user } = renderWithProviders(<TopUpForm />, { user: TEST_USER });

    await user.type(screen.getByLabelText('Nominal'), '10000000');
    await user.click(screen.getByRole('button', { name: 'Topup saldo' }));

    expect(
      await screen.findByText('Nominal topup harus kurang dari 10.000.000.'),
    ).toBeVisible();
  });

  it('sends the amount as a number and confirms', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('/topup'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderWithProviders(<TopUpForm />, { user: TEST_USER });

    await user.type(screen.getByLabelText('Nominal'), '1500,5');
    await user.click(screen.getByRole('button', { name: 'Topup saldo' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Topup 1.500,5 berhasil.',
    );
    expect(body).toEqual({ amount: 1500.5 });
    expect(screen.getByLabelText('Nominal')).toHaveValue('');
  });

  it('fills in a quick amount', async () => {
    const { user } = renderWithProviders(<TopUpForm />, { user: TEST_USER });

    await user.click(screen.getByRole('button', { name: '100.000' }));

    expect(screen.getByLabelText('Nominal')).toHaveValue('100000');
  });

  it('shows the error from the API', async () => {
    server.use(
      http.post(apiUrl('/topup'), () =>
        HttpResponse.json({ code: 'InvalidAmountError' }, { status: 400 }),
      ),
    );
    const { user } = renderWithProviders(<TopUpForm />, { user: TEST_USER });

    await user.type(screen.getByLabelText('Nominal'), '5');
    await user.click(screen.getByRole('button', { name: 'Topup saldo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nominal tidak valid.',
    );
  });
});
