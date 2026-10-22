import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { tokenStorage } from '@/shared/lib/token-storage';
import { renderWithProviders } from '@/test/render';
import { apiUrl, server } from '@/test/server';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('validates the fields before calling the API', async () => {
    const { user } = renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByText('Username wajib diisi.')).toBeVisible();
    expect(screen.getByText('Password wajib diisi.')).toBeVisible();
  });

  it('signs in with username and password', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('/login'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ token: 'new-token' });
      }),
      http.get(apiUrl('/me'), () =>
        HttpResponse.json({ username: 'alice', role: 'USER' }),
      ),
    );
    const { user } = renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Username'), ' alice ');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(tokenStorage.get()).toBe('new-token'));
    expect(body).toEqual({ username: 'alice', password: 'password123' });
  });

  it('shows invalid credentials without signing out', async () => {
    server.use(
      http.post(apiUrl('/login'), () =>
        HttpResponse.json(
          {
            statusCode: 401,
            message: 'Invalid username or password',
            code: 'InvalidCredentialsError',
          },
          { status: 401 },
        ),
      ),
    );
    const { user } = renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Username atau password salah.',
    );
    expect(tokenStorage.get()).toBeNull();
  });
});
