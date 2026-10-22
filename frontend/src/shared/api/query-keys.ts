/**
 * Every query key in one place, so a mutation in one feature can invalidate
 * data owned by another without importing it. Keys are grouped by the data
 * they depend on: `wallet`, `stats` and `transactions` all change on a topup
 * or transfer.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  balance: ['wallet', 'balance'] as const,
  stats: ['stats'] as const,
  topUsers: ['stats', 'top-users'] as const,
  topTransactions: ['stats', 'top-transactions'] as const,
  transactions: ['transactions'] as const,
  activity: (since: string) => ['transactions', 'activity', since] as const,
  myTransactions: (params: object) => ['transactions', 'mine', params] as const,
  allTransactions: (params: object) => ['transactions', 'all', params] as const,
};
