import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { toApiError } from './api-error';

function responseError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('failed', undefined, config, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  });
}

describe('toApiError', () => {
  it('maps a known error code to its message', () => {
    expect(
      toApiError(responseError(400, { code: 'InsufficientBalanceError' })),
    ).toEqual({
      status: 400,
      code: 'InsufficientBalanceError',
      message: 'Saldo tidak mencukupi.',
    });
  });

  it.each([
    [409, 'UsernameAlreadyExistsError', 'Username sudah digunakan.'],
    [404, 'RecipientNotFoundError', 'User tujuan tidak ditemukan.'],
    [401, 'InvalidCredentialsError', 'Username atau password salah.'],
  ])('maps %i %s', (status, code, message) => {
    expect(toApiError(responseError(status, { code })).message).toBe(message);
  });

  it('falls back to the status when there is no code', () => {
    expect(
      toApiError(responseError(403, { message: 'Forbidden' })).message,
    ).toBe('Anda tidak punya akses ke halaman ini.');
  });

  it('uses a generic message for server errors', () => {
    expect(toApiError(responseError(500, {})).message).toBe(
      'Terjadi kesalahan di server. Coba lagi nanti.',
    );
  });

  it('reports a network failure', () => {
    expect(toApiError(new AxiosError('Network Error'))).toEqual({
      status: null,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
    });
  });

  it('handles errors that are not from Axios', () => {
    expect(toApiError(new Error('boom')).status).toBeNull();
  });
});
