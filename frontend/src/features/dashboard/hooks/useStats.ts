import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { getTopTransactions, getTopUsers } from '../api/stats.api';

export function useTopUsers() {
  return useQuery({ queryKey: queryKeys.topUsers, queryFn: getTopUsers });
}

export function useTopTransactions() {
  return useQuery({
    queryKey: queryKeys.topTransactions,
    queryFn: getTopTransactions,
  });
}
