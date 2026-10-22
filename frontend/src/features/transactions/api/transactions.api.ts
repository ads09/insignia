import { http } from '@/shared/api/http';
import { toQueryParams } from '../lib/filters';
import type {
  LedgerTransaction,
  LedgerTransactionType,
  Page,
  TransactionFilters,
  UserTransaction,
  UserTransactionType,
} from '../types';

export async function getMyTransactions(
  filters: TransactionFilters<UserTransactionType>,
): Promise<Page<UserTransaction>> {
  // The user's own list has no username filter.
  const { username: _username, ...params } = filters;
  const { data } = await http.get<Page<UserTransaction>>('/transactions', {
    params: toQueryParams(params),
  });
  return data;
}

export async function getAllTransactions(
  filters: TransactionFilters<LedgerTransactionType>,
): Promise<Page<LedgerTransaction>> {
  const { data } = await http.get<Page<LedgerTransaction>>(
    '/admin/transactions',
    {
      params: toQueryParams(filters),
    },
  );
  return data;
}
