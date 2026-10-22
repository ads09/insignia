import { http } from '@/shared/api/http';

export interface TopUser {
  username: string;
  transacted_value: number;
}

export interface TopTransaction {
  /** The other party of the transfer. */
  username: string;
  /** Negative for money sent (debit), positive for money received (credit). */
  amount: number;
}

export async function getTopUsers(): Promise<TopUser[]> {
  const { data } = await http.get<TopUser[]>('/top_users');
  return data;
}

export async function getTopTransactions(): Promise<TopTransaction[]> {
  const { data } = await http.get<TopTransaction[]>(
    '/top_transactions_per_user',
  );
  return data;
}
