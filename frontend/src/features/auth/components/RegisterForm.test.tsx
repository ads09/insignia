import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { tokenStorage } from '@/shared/lib/token-storage';
import { renderWithProviders } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { RegisterForm } from './RegisterForm';

async function fill(
  user: ReturnType<typeof renderWithProviders>['user'],
  confirm = 'password123',
) {
  await user.type(screen.getByLabelText('Username'), 'newuser');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.type(screen.getByLabelText('Ulangi password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Buat akun' }));
}

describe('RegisterForm', () => {
  it('requires a password of at least 8 characters', async () => {
    const { user } = renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Buat akun' }));

    expect(
      await screen.findByText('Password minimal 8 karakter.'),
    ).toBeVisible();
  });

  it('requires both passwords to match', async () => {
    const { user } = renderWithProviders(<RegisterForm />);

    await fill(user, 'password124');

    expect(
      await screen.findByText('Konfirmasi password tidak sama.'),
    ).toBeVisible();
  });

  it('creates the account with POST /user and signs in', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('/user'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: 'fresh-token' }, { status: 201 });
      }),
      http.get(apiUrl('/me'), () =>
        HttpResponse.json({ username: 'newuser', role: 'USER' }),
      ),
    );
    const { user } = renderWithProviders(<RegisterForm />);

    await fill(user);

    await waitFor(() => expect(tokenStorage.get()).toBe('fresh-token'));
    expect(body).toEqual({ username: 'newuser', password: 'password123' });
  });

  it('reports a username that is taken', async () => {
    server.use(
      http.post(apiUrl('/user'), () =>
        HttpResponse.json(
          { code: 'UsernameAlreadyExistsError' },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderWithProviders(<RegisterForm />);

    await fill(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Username sudah digunakan.',
    );
  });
});
