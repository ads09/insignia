import axios from 'axios';

/** Error codes sent by the backend in the `code` field of an error body. */
type ApiErrorCode =
  | 'InvalidAmountError'
  | 'InvalidCredentialsError'
  | 'UsernameAlreadyExistsError'
  | 'InsufficientBalanceError'
  | 'RecipientNotFoundError'
  | 'SelfTransferError'
  | 'InvalidTransactionQueryError';

interface ApiError {
  /** HTTP status, or `null` when the server could not be reached. */
  status: number | null;
  code?: string;
  message: string;
}

const MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  InvalidAmountError: 'Nominal tidak valid.',
  InvalidCredentialsError: 'Username atau password salah.',
  UsernameAlreadyExistsError: 'Username sudah digunakan.',
  InsufficientBalanceError: 'Saldo tidak mencukupi.',
  RecipientNotFoundError: 'User tujuan tidak ditemukan.',
  SelfTransferError: 'Tidak bisa transfer ke akun sendiri.',
  InvalidTransactionQueryError: 'Filter tidak valid. Periksa kembali isinya.',
};

const MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Data yang dikirim tidak valid.',
  401: 'Sesi Anda berakhir. Silakan masuk lagi.',
  403: 'Anda tidak punya akses ke halaman ini.',
  404: 'Data tidak ditemukan.',
  409: 'Data sudah ada.',
};

interface ErrorBody {
  code?: unknown;
}

/** Turns any thrown value into a message that can be shown to the user. */
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ErrorBody>(error)) {
    return { status: null, message: 'Terjadi kesalahan. Coba lagi.' };
  }
  if (!error.response) {
    return {
      status: null,
      message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
    };
  }

  const { status, data } = error.response;
  const code = typeof data?.code === 'string' ? data.code : undefined;
  const message =
    (code && MESSAGE_BY_CODE[code as ApiErrorCode]) ??
    MESSAGE_BY_STATUS[status] ??
    'Terjadi kesalahan di server. Coba lagi nanti.';
  return { status, code, message };
}
