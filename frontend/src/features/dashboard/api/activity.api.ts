import { http } from '@/shared/api/http';

/** The fields of `GET /transactions` the dashboard needs. */
export interface ActivityTransaction {
  type: 'credit' | 'debit' | 'topup';
  /** Signed: negative for debits. */
  amount: number;
  created_at: string;
}

interface Activity {
  transactions: ActivityTransaction[];
  /** Number of transactions in the period, which can exceed what was loaded. */
  total: number;
}

/** The largest page the API returns. */
const ACTIVITY_LIMIT = 100;

/** The user's transactions since `since` (YYYY-MM-DD), newest first. */
export async function getActivity(since: string): Promise<Activity> {
  const { data } = await http.get<{
    data: ActivityTransaction[];
    meta: { total: number };
  }>('/transactions', {
    params: {
      start_date: since,
      limit: ACTIVITY_LIMIT,
      sort: 'created_at',
      order: 'desc',
    },
  });
  return { transactions: data.data, total: data.meta.total };
}
