import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { getAllTransactions, getMyTransactions } from '../api/transactions.api';
import type {
  LedgerTransactionType,
  TransactionFilters,
  UserTransactionType,
} from '../types';

export function useMyTransactions(
  filters: TransactionFilters<UserTransactionType>,
) {
  return useQuery({
    queryKey: queryKeys.myTransactions(filters),
    queryFn: () => getMyTransactions(filters),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useAllTransactions(
  filters: TransactionFilters<LedgerTransactionType>,
) {
  return useQuery({
    queryKey: queryKeys.allTransactions(filters),
    queryFn: () => getAllTransactions(filters),
    placeholderData: keepPreviousData,
  });
}
