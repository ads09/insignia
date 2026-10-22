import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { getBalance, topUp, transfer } from '../api/wallet.api';

export function useBalance() {
  return useQuery({ queryKey: queryKeys.balance, queryFn: getBalance });
}

/** Everything a topup or a transfer can change. */
function useInvalidateWalletData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.balance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
    ]);
}

export function useTopUp() {
  const invalidate = useInvalidateWalletData();
  return useMutation({ mutationFn: topUp, onSuccess: invalidate });
}

export function useTransfer() {
  const invalidate = useInvalidateWalletData();
  return useMutation({ mutationFn: transfer, onSuccess: invalidate });
}
