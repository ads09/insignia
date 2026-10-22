import type { LedgerTransactionType, UserTransactionType } from '../types';

export type TransactionType = UserTransactionType | LedgerTransactionType;

export const TYPE_LABELS: Record<TransactionType, string> = {
  credit: 'Masuk',
  debit: 'Keluar',
  topup: 'Topup',
  transfer: 'Transfer',
};
